import { DataTypes } from "sequelize";
import sequelize from "../../db.js";


export const store=sequelize.define("store",{
   id:{
       type:DataTypes.INTEGER,
       primaryKey:true,
       autoIncrement:true
    }, 
   seller_id:{
     type:DataTypes.INTEGER,
     references:{
     model:"seller",
     key:"id" }
     },
   store_name:{
       type:DataTypes.STRING,
    //    unique:true,
       allowNull:false
   },
   store_details:{
       type:DataTypes.STRING,
       allowNull:false
   },
   store_logo:{
       type:DataTypes.STRING,
       allowNull:false
   },
   store_slug:{
       type:DataTypes.STRING,
    //    unique:true,
       allowNull:false
   }
   },{
       timestamps:true,
       paranoid:true,
       tableName:"store"
})