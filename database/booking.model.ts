import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
  },
  { timestamps: true }
);

// Pre-save hook to validate if referenced Event exists
BookingSchema.pre('save', async function (next) {
  if (this.isModified('eventId')) {
    try {
      const eventExists = await Event.exists({ _id: this.eventId });
      if (!eventExists) {
        return next(new Error(`Validation failed: Event with ID ${this.eventId} does not exist.`));
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
