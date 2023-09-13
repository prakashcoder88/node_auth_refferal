const mongoose = require("mongoose")

const StudentSchema = mongoose.Schema({

    studentid:{
        type:String,
        require:false
    },
    studentname :{
        type:String,
        require:false
    },
    email:{
        type: String,
        require:false
    },
    class:{
    type:String,
    require:false
    },
    mark:{
    type:String,
    require:false
    },
    age:{
    type:String,
    require:false
    },
    gender:{
    type:String,
    require:false
    },

    accesstoken:{
        type:String,
        require:false
    }
})

 const Student = mongoose.model("Student", StudentSchema)
 module.exports = Student