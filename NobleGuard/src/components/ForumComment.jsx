{
  "name": "ForumComment",
  "type": "object",
  "properties": {
    "post_id": {
      "type": "string",
      "description": "ID of the parent post"
    },
    "content": {
      "type": "string",
      "description": "Comment content"
    },
    "upvotes": {
      "type": "number",
      "default": 0,
      "description": "Upvote count"
    }
  },
  "required": [
    "post_id",
    "content"
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