const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
	first_name: { type: String, required: true, maxLength: 100 },
	family_name: { type: String, required: true, maxLength: 100 },
	date_of_birth: { type: Date },
	date_of_death: { type: Date },
});

// a virtual to handle a missing first or last name

AuthorSchema.virtual('name').get(function () {
	let fullName = '';
	if (this.first_name && this.family_name) {
		fullName = `${this.first_name}, ${this.family_name}`;
	}

	return fullName;
});

// virtual of author's url page

AuthorSchema.virtual('url').get(function () {
	return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('dates_formatted').get(function () {
	const x = this.date_of_birth
		? ` ${DateTime.fromJSDate(this.date_of_birth).toLocaleString(
				DateTime.DATE_MED
		  )}`
		: '';

	const y = this.date_of_death
		? ` - ${DateTime.fromJSDate(this.date_of_death).toLocaleString(
				DateTime.DATE_MED
		  )}`
		: '';

	return x + y;
});

AuthorSchema.virtual('birth_formatted').get(function () {
	return DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-MM-dd');
});

AuthorSchema.virtual('death_formatted').get(function () {
	return DateTime.fromJSDate(this.date_of_death).toFormat('yyyy-MM-dd');
});

module.exports = mongoose.model('Author', AuthorSchema);
