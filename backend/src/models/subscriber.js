import mongoose from 'mongoose';
import crypto from 'crypto';

const subscriberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed'
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null values
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    unsubscribedAt: {
      type: Date
    },
    source: {
      type: String,
      enum: ['website', 'manual', 'import', 'api'],
      default: 'website'
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
// email and unsubscribeToken already have unique indexes from schema definition
subscriberSchema.index({ status: 1 });

// Virtual to check if subscribed
subscriberSchema.virtual('isSubscribed').get(function () {
  return this.status === 'subscribed';
});

// Method to generate unsubscribe token
subscriberSchema.methods.generateUnsubscribeToken = function () {
  this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  return this.unsubscribeToken;
};

// Static method to get active subscribers
subscriberSchema.statics.getActiveSubscribers = function (userId) {
  return this.find({
    user: userId,
    status: 'subscribed'
  });
};

// Static method to get subscriber count by status
subscriberSchema.statics.getSubscriberStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    subscribed: 0,
    unsubscribed: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;