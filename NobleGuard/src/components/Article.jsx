{
  "name": "Article",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Article title"
    },
    "category": {
      "type": "string",
      "enum": [
        "rugpull_prevention",
        "defi_security",
        "smart_contracts",
        "tokenomics",
        "noblepad_features",
        "case_studies"
      ],
      "description": "Article category"
    },
    "content": {
      "type": "string",
      "description": "Full article content in markdown"
    },
    "excerpt": {
      "type": "string",
      "description": "Short summary"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags for searchability"
    },
    "featured": {
      "type": "boolean",
      "default": false,
      "description": "Featured article"
    },
    "read_time": {
      "type": "number",
      "description": "Estimated read time in minutes"
    }
  },
  "required": [
    "title",
    "category",
    "content",
    "excerpt"
  ]
}