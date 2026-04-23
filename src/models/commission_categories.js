import sequelize from "../../db.js";
import { DataTypes } from "sequelize";

export const Categories_Commission=sequelize.define("category_commission",{

   id:{
       type:DataTypes.INTEGER,
       autoIncrement:true,
       primaryKey:true
   },
   seller_id:{
         type:DataTypes.INTEGER,
         allowNull:false,
         references:{
         model:"seller",
         key:'id'
         },
         onDelete:"CASCADE",
         onUpdate:"CASCADE"
   },
  categories:{
    type:DataTypes.INTEGER,
    allowNull:false,
 },
  category_commission:{
      type:DataTypes.FLOAT,
      allowNull:true,
      defaultValue:0.0,
      validate:{
          min:0.0,
          max:100.0
    }
}
},{ timestamps:true,
    tableName:"category_commission"
})