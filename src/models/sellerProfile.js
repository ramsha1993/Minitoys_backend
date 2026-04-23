import { Sequelize,DataTypes } from "sequelize";
import sequelize from "../../db.js";
export const seller=sequelize.define('seller' ,{


      id:{
         type:DataTypes.INTEGER,
         autoIncrement:true,
         primaryKey:true
         },
      user_id:{
          type:DataTypes.INTEGER,
          allowNull:false,
          unique:true,
          references:{
          model:'users',
          key:'id' 
        
},       onDelete:'CASCADE',
          onUpdate:'CASCADE'
      },
     commission:{
        type:DataTypes.FLOAT,
        allowNull:false,
        
        validate:{
            min:0,
            max:100
        }
    },
    mobile:{
   type:DataTypes.INTEGER,
   allowNull:false
    },
    authorized_signature:{
       type:DataTypes.STRING,
       allowNull:true,
    //    validate:{
    //     isUrl:true
    //    }
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    
   },{
    timestamps:true,
    tableName:'seller'
   })
