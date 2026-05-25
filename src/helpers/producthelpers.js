import fs  from "fs";
import csv from "csv-parser";
import { Category } from "../models/category.js";
import {client} from '../utils/elastic.js'
import {
  validateName, validatePrice, validateStock, validateDescription,
  validateImage, validateAdditionalImages, validateCategory, validateDuplicate,
} from "../validators/productValidators.js";
import { Product } from "../models/product_Two.js";

export const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end",  () => resolve(rows))
      .on("error", reject);
  }

);

export const cleanupFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Failed to delete temp file ${filePath}:`, err);
  });
};

export const buildCategoryMap = async () => {
  const categories = await Category.findAll({});
  return new Map(categories.map((c) => [c.name.toLowerCase().trim(), c]));
};

export const fetchExistingNames = async (names, user_id) => {
  if (!names.length) return new Set();
  const existing = await Product.findAll({
    where: { name: names, user_id },
    attributes: ["name"],
  });
  return new Set(existing.map((p) => p.name.toLowerCase().trim()));
};

export const validateRows = (rows, categoryMap, existingNameSet) => {
  const errors   = [];
  const products = [];

  rows.forEach((row, i) => {
    const rowNum = i + 2;
    const name   = (row.name  ?? "").trim();
    const price  = (row.price ?? "").trim();
    const { error: catError, category } = validateCategory(row.category, categoryMap, rowNum);

    const rowErrors = [
      validateName(name, rowNum),
      validatePrice(price, rowNum),
      validateStock(row.stock, rowNum),
      validateDescription(row.description, rowNum),
      validateImage(row.image, rowNum),
      ...validateAdditionalImages(row.additional_images, rowNum),
      catError,
      validateDuplicate(name, existingNameSet, rowNum),
    ].filter(Boolean);

    if (rowErrors.length) { errors.push(...rowErrors); return; }

    products.push({
      name,
      price:             parseFloat(price),
      description:       row.description ?? null,
      category_id:       category.id,
      stock:             row.stock ? parseInt(row.stock, 10) : 0,
      image:             row.image ?? null,
      additional_images: row.additional_images
        ? String(row.additional_images).split(",").map((s) => s.trim())
        : [],
    });
  });

  return { errors, products };
};

export const indexToOpenSearch = async (result) => {
  const bulkBody = result.flatMap((product) => [
    { index: { _index: "products", _id: product.id } },
    product.get({ plain: true }),
  ]);

  const response = await client.bulk({ body: bulkBody, refresh: true });
  if (!response.errors) return true;

  const indexedIds = new Set(
    response.items
      .filter((item) => !item.index?.error)
      .map((item) => String(item.index._id))
  );

  const deleteBody = result
    .filter((p) => indexedIds.has(String(p.id)))
    .flatMap((p) => [{ delete: { _index: "products", _id: p.id } }]);

  if (deleteBody.length) await client.bulk({ body: deleteBody, refresh: true });

  return false;
};