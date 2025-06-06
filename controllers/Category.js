const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.categoryPageDetails = async (req, res) => {
	try {
		const { categoryId } = req.body;

		// First, fetch the raw category to debug all courses
		const rawCategory = await Category.findById(categoryId).populate("courses");
		if (!rawCategory) {
			console.log("Category not found.");
			return res.status(404).json({ success: false, message: "Category not found" });
		}

		console.log("All courses in category (raw, before filtering):");
		rawCategory.courses.forEach(course => {
			console.log(`- ${course.courseName} | status: ${course.status}`);
		});

		// Now, populate only the published courses
		const selectedCategory = await Category.findById(categoryId)
			.populate({
				path: "courses",
				//match: { status: "Published" },
				populate: [
					{ path: "instructor" },
					{ path: "ratingAndReviews" }
				]
			})
			.exec();

		if (!selectedCategory) {
			// Shouldn't happen since we already checked above
			return res.status(404).json({ success: false, message: "Category not found" });
		}

		if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
			console.log("No published courses found for this category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;

		// Get courses for other categories (excluding current)
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },
		}).populate({
			path: "courses",
			match: { status: "Published" },
			populate: [
				{ path: "instructor" },
				{ path: "ratingAndReviews" }
			]
		});

		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		// Get top-selling published courses
		const allCategories = await Category.find().populate({
			path: "courses",
			match: { status: "Published" },
			populate: [
				{ path: "instructor" },
				{ path: "ratingAndReviews" }
			]
		});

		const allCourses = allCategories.flatMap(category => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		return res.status(200).json({
			selectedCourses,
			differentCourses,
			mostSellingCourses,
			success: true,
		});
	} catch (error) {
		console.error("Error in categoryPageDetails:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};


//add course to category
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	// console.log("category id", categoryId);
	try {
		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		if(category.courses.includes(courseId)){
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.courses.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	}
	catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}