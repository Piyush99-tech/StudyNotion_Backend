const Section = require("../models/Section");
const Course = require("../models/Course");
// CREATE a new section

exports.createSection = async (req,res) => {
    try{
        //Data Fetch
        const {sectionName,courseId} = req.body;

        //Validate
        if(!sectionName || !courseId){
            return res.status(401).json(
                {
                    success:false,
                    message:"Missing Properties!"
                }
            );
        }

        //Create Section
        const newSection = await Section.create({sectionName});

        //Insert the Section in the Course
        const updatedCourse = await Course.findByIdAndUpdate(courseId,
            {
                $push:{
                    courseContent: newSection._id,
                }
            },
            {new:true},
        ).populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();
        
        //Return the response of the insertion
        return res.status(200).json(
            {
                success:true,
                message:"A new Section was created!!",
                updatedCourse,
            }
        )
    }
    catch(error){
        console.error(error);
        return res.status(500).json(
            {
                success:false,
                message:"Some error occured while Creation of Section",
                error:error.message,
            }
        )
    }
}

// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		console.log(sectionName, sectionId);
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section updated successfully",
			updatedCourse,

		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {
		const { sectionId,courseId } = req.body;
		await Section.findByIdAndDelete(sectionId);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section deleted",
			updatedCourse,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
