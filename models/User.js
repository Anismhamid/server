const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        id: {
            type: String,
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        name: {
            first: {
                type: String,
                required: true,
                minlength: 2,
                trim: true,
            },
            last: {
                type: String,
                required: true,
                minlength: 2,
                trim: true,
            },
        },

        slug: {
            type: String,
            trim: true,
        },

        phone: {
            phone_1: {
                type: String,
                required: true,
            },
            phone_2: {
                type: String,
            },
        },

        address: {
            city: {
                type: String,
            },
            street: {
                type: String,
            },
            houseNumber: {
                type: String,
            },
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
        },

        personalEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        gender: {
            type: String,
            enum: ['male', 'female'],
        },

        image: {
            url: {
                type: String,
            },
            alt: {
                type: String,
            },
        },

        role: {
            type: String,
            enum: ['Admin', 'Moderator', 'Client'],
            default: 'Client',
        },

        activity: {
            type: Array,
            default: [],
        },

        registrAt: {
            type: String,
        },

        messageStatus: {
            type: String,
            default: 'unread',
        },

        terms: {
            type: String,
        },

        pushTokens: {
            type: [String],
            default: [],
        },

        resetPasswordToken: {
            type: String,
            select: false,
        },

        resetPasswordExpires: {
            type: Date,
            select: false,
        },

        /*
        |--------------------------------------------------------------------------
        | ONLINE STATUS
        |--------------------------------------------------------------------------
        |
        | هذا ليس تعطيل الحساب.
        | فقط هل المستخدم متصل حالياً أم لا.
        |
        */

        status: {
            type: Boolean,
            default: false,
        },

        /*
        |--------------------------------------------------------------------------
        | ACCOUNT STATUS
        |--------------------------------------------------------------------------
        |
        | active   = الحساب فعال
        | disabled = الحساب معطل
        |
        */

        accountStatus: {
            type: String,
            enum: ['active', 'disabled'],
            default: 'active',
            index: true,
        },

        /*
        |--------------------------------------------------------------------------
        | ACCOUNT PERMISSIONS
        |--------------------------------------------------------------------------
        |
        | كل عملية لها قيمة مستقلة في قاعدة البيانات.
        |
        */

        permissions: {
            canLogin: {
                type: Boolean,
                default: true,
            },

            canCreatePosts: {
                type: Boolean,
                default: true,
            },

            canSendMessages: {
                type: Boolean,
                default: true,
            },

            canSendOffers: {
                type: Boolean,
                default: true,
            },

            canUseAccount: {
                type: Boolean,
                default: true,
            },

            canAccessExistingData: {
                type: Boolean,
                default: true,
            },

            // ==========================================
            // Message investigation
            // ==========================================

            canViewMessages: {
                type: Boolean,
                default: false,
            },

            canViewMessageAuditLogs: {
                type: Boolean,
                default: false,
            },
        },
    },

    {
        timestamps: true,
    },
);

const User = mongoose.model('Users', userSchema);

module.exports = User;
