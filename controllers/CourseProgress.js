const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  console.log("hy i am inside update couese progess C.ID ->",courseId);
   console.log("hy i am inside update couese progess s.ID ->",subsectionId);
    console.log("hy i am inside update couese progess user.ID ->",userId);
  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ error: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userID: userId,
    })

    console.log("i am still inside update course progress",courseProgress);
   if (!courseProgress) {
  return res.status(200).json({
    success: false,
    message: "Course progress Does Not Exist",
  });
}
 else {
      // If course progress exists, check if the subsection is already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({ error: "Subsection already completed" })
      }

      console.log("successfully pushed into completed videos")
      // Push the subsection into the completedVideos array
      courseProgress.completedVideos.push(subsectionId)
    }

    // Save the updated course progress
    await courseProgress.save();
    console.log("Saved courseProgress:", courseProgress);


    return res.status(200).json({ message: "Course progress updated" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
