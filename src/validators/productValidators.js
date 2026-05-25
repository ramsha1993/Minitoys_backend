const VALIDATION = {
  name:              { min: 2, max: 100 },
  description:       { max: 1000 },
  image:             { max: 500 },
  price:             { min: 0, max: 1_000_000 },
  stock:             { min: 0, max: 100_000 },
  additional_images: { maxCount: 10, maxUrlLength: 500 },
};

const isValidUrl = (str) => {
  try { new URL(str); return true; }
  catch { return false; }
};

export const validateName = (name, rowNum) => {
  if (!name)                               return `Row ${rowNum}: name is required`;
  if (name.length < VALIDATION.name.min)  return `Row ${rowNum}: name must be at least ${VALIDATION.name.min} characters`;
  if (name.length > VALIDATION.name.max)  return `Row ${rowNum}: name must not exceed ${VALIDATION.name.max} characters`;
//   if (!/^[\w\s&.,'\u2013\u2014]+$/i.test(name))
//  return `Row ${rowNum}: name contains invalid characters`;
  return null;
};

export const validatePrice = (raw, rowNum) => {
  if (!raw)                                     return `Row ${rowNum}: price is required`;
  const price = parseFloat(raw);
  if (isNaN(price))                             return `Row ${rowNum}: price must be a valid number`;
  if (price < VALIDATION.price.min)             return `Row ${rowNum}: price must be 0 or greater`;
  if (price > VALIDATION.price.max)             return `Row ${rowNum}: price must not exceed ${VALIDATION.price.max.toLocaleString()}`;
//   if (!/^\d+(\.\d{1,2})?$/.test(raw.trim()))   return `Row ${rowNum}: price must have at most 2 decimal places`;
  return null;
};

export const validateStock = (raw, rowNum) => {
  if (!raw) return null;
  const stock = Number(raw);
  if (!Number.isInteger(stock))                 return `Row ${rowNum}: stock must be a whole number`;
  if (stock < VALIDATION.stock.min)             return `Row ${rowNum}: stock must be 0 or greater`;
  if (stock > VALIDATION.stock.max)             return `Row ${rowNum}: stock must not exceed ${VALIDATION.stock.max.toLocaleString()}`;
  return null;
};

export const validateDescription = (desc, rowNum) => {
  if (!desc) return null;
  if (desc.length > VALIDATION.description.max) return `Row ${rowNum}: description must not exceed ${VALIDATION.description.max} characters`;
  return null;
};

export const validateImage = (url, rowNum, fieldName = "image") => {
  if (!url) return null;
  if (url.length > VALIDATION.image.max)         return `Row ${rowNum}: ${fieldName} URL must not exceed ${VALIDATION.image.max} characters`;
  if (!isValidUrl(url))                          return `Row ${rowNum}: ${fieldName} must be a valid URL`;
  // if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) return `Row ${rowNum}: ${fieldName} must point to a valid image`;
  return null;
};

export const validateAdditionalImages = (raw, rowNum) => {
  if (!raw) return [];
  const urls = String(raw).split(",").map((s) => s.trim()).filter(Boolean);
  if (urls.length > VALIDATION.additional_images.maxCount)
    return [`Row ${rowNum}: additional_images must not exceed ${VALIDATION.additional_images.maxCount} URLs`];
  return urls.map((url, idx) => validateImage(url, rowNum, `additional_images[${idx + 1}]`)).filter(Boolean);
};

export const validateCategory = (raw, categoryMap, rowNum) => {
  const key = (raw ?? "").toLowerCase().trim();
  if (!key) return { error: `Row ${rowNum}: category is required`, category: null };
  const category = categoryMap.get(key);
  if (!category) return { error: `Row ${rowNum}: invalid category "${raw}"`, category: null };
  return { error: null, category };
};

export const validateDuplicate = (name, existingNameSet, rowNum) => {
  if (name && existingNameSet.has(name.toLowerCase()))
    return `Row ${rowNum}: product "${name}" already exists`;
  return null;
};