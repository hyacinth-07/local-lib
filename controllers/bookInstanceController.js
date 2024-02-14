const BookInstance = require('../models/bookInstance');
const Book = require('../models/book');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bookInstance = require('../models/bookInstance');

// Display list of all bookInstances.
exports.bookInstance_list = asyncHandler(async (req, res, next) => {
	const allBookInstances = await BookInstance.find().populate('book').exec();

	res.render('layout', {
		title: 'Book Instance List',
		bookInstance_list: allBookInstances,
		template: 'instance',
	});
});

// Display detail page for a specific BookInstance.
exports.bookInstance_detail = asyncHandler(async (req, res, next) => {
	const bookInstance = await BookInstance.findById(req.params.id)
		.populate('book')
		.exec();

	if (bookInstance === null) {
		// No results.
		const err = new Error('Book copy not found');
		err.status = 404;
		return next(err);
	}

	res.render('layout', {
		template: 'bookInstance_detail',
		title: 'Book:',
		bookInstance: bookInstance,
	});
});

// Display BookInstance create form on GET.
exports.bookInstance_create_get = asyncHandler(async (req, res, next) => {
	const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

	res.render('layout', {
		template: 'bookInstance_form',
		title: 'Create BookInstance',
		book_list: allBooks,
	});
});

// Handle BookInstance create on POST.
exports.bookInstance_create_post = [
	// Validate and sanitize fields.
	body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
	body('imprint', 'Imprint must be specified')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('status').escape(),
	body('due_back', 'Invalid date')
		.optional({ values: 'falsy' })
		.isISO8601()
		.toDate(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		const bookInstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
		});

		if (!errors.isEmpty()) {
			// There are errors.
			// Render form again with sanitized values and error messages.
			const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

			res.render('layout', {
				template: 'bookInstance_form',
				title: 'Create BookInstance',
				book_list: allBooks,
				selected_book: bookInstance.book._id,
				errors: errors.array(),
				bookInstance: bookInstance,
			});
			return;
		} else {
			// Data from form is valid
			await bookInstance.save();
			res.redirect(bookInstance.url);
		}
	}),
];

// Display bookInstance delete form on GET.
exports.bookInstance_delete_get = asyncHandler(async (req, res, next) => {
	const copy = await BookInstance.findById(req.params.id)
		.populate('book')
		.exec();

	if (copy === null) {
		res.redirect('/catalog/bookInstance');
	}

	res.render('layout', {
		template: 'bookInstance_delete',
		title: 'Delete Copy',
		copy: copy,
	});
});

// Handle bookInstance delete on POST.
exports.bookInstance_delete_post = asyncHandler(async (req, res, next) => {
	await bookInstance.findByIdAndDelete(req.body.id);
	res.redirect('/catalog/bookInstance');
});

// Display bookInstance update form on GET.
exports.bookInstance_update_get = asyncHandler(async (req, res, next) => {
	res.send('NOT IMPLEMENTED: bookInstance update GET');
});

// Handle bookInstance update on POST.
exports.bookInstance_update_post = asyncHandler(async (req, res, next) => {
	res.send('NOT IMPLEMENTED: bookInstance update POST');
});
