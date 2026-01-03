{
  "name": "ForumPost",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Discussion title"
    },
    "content": {
      "type": "string",
      "description": "Post content"
    },
    "category": {
      "type": "string",
      "enum": [
        "general",
        "security_questions",
        "project_reviews",
        "noblepad_support",
        "defi_news",
        "community"
      ],
      "description": "Discussion category"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags"
    },
    "upvotes": {
      "type": "number",
      "default": 0,
      "description": "Upvote count"
    },
    "view_count": {
      "type": "number",
      "default": 0,
      "description": "View count"
    },
    "pinned": {
      "type": "boolean",
      "default": false,
      "description": "Pinned post"
    }
  },
  "required": [
    "title",
    "content",
    "category"
  ],
  "rls": {
    "create": {
      "user_condition": {
        "role": {
          "$ne": null
        }
      }
    },
    "read": {},
    "update": {
      "$or": [
        {
          "created_by": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "$or": [
        {
          "created_by": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    }
  }
}