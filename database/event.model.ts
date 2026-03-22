import { Schema, model, models, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const nonEmptyArrayValidator = (v: string[]) => Array.isArray(v) && v.length > 0;

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: [nonEmptyArrayValidator, 'Agenda cannot be empty'],
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: [nonEmptyArrayValidator, 'Tags cannot be empty'],
    },
  },
  { timestamps: true }
);

// Pre-save hook: slug generation, date parsing, and time formatting
EventSchema.pre('save', function (next) {
  // Generate URL-friendly slug if title is modified
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Normalize date string to an ISO format
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date format provided.'));
    }
    this.date = parsedDate.toISOString();
  }

  // Ensure simple and consistent time string format
  if (this.isModified('time')) {
    this.time = this.time.trim().toUpperCase();
  }

  next();
});

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
