// YouCreator.AI MongoDB 数据库初始化脚本

// 切换到youcreator数据库
db = db.getSiblingDB('youcreator');

// 创建用户（如果需要）
// db.createUser({
//   user: "youcreator",
//   pwd: "youcreator123",
//   roles: [{ role: "readWrite", db: "youcreator" }]
// });

// 创建内容集合
db.createCollection("contents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["project_id", "user_id", "type", "data"],
      properties: {
        project_id: {
          bsonType: "long",
          description: "项目ID，必须是数字"
        },
        user_id: {
          bsonType: "long", 
          description: "用户ID，必须是数字"
        },
        type: {
          enum: ["text", "image", "music", "code"],
          description: "内容类型，必须是指定的枚举值"
        },
        title: {
          bsonType: "string",
          description: "内容标题"
        },
        data: {
          bsonType: "object",
          description: "内容数据，必须是对象"
        },
        metadata: {
          bsonType: "object",
          description: "元数据"
        },
        version: {
          bsonType: "int",
          minimum: 1,
          description: "版本号"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间"
        },
        updated_at: {
          bsonType: "date", 
          description: "更新时间"
        }
      }
    }
  }
});

// 创建版本历史集合
db.createCollection("content_versions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["content_id", "version", "data", "created_by"],
      properties: {
        content_id: {
          bsonType: "objectId",
          description: "内容ID"
        },
        version: {
          bsonType: "int",
          minimum: 1,
          description: "版本号"
        },
        data: {
          bsonType: "object",
          description: "版本数据"
        },
        created_by: {
          bsonType: "long",
          description: "创建者用户ID"
        },
        changes: {
          bsonType: "array",
          description: "变更记录"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间"
        }
      }
    }
  }
});

// 创建媒体文件集合
db.createCollection("media_files", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["project_id", "user_id", "filename", "file_data"],
      properties: {
        project_id: {
          bsonType: "long",
          description: "项目ID"
        },
        user_id: {
          bsonType: "long",
          description: "用户ID"
        },
        filename: {
          bsonType: "string",
          description: "文件名"
        },
        file_data: {
          bsonType: "binData",
          description: "文件二进制数据"
        },
        mime_type: {
          bsonType: "string",
          description: "MIME类型"
        },
        file_size: {
          bsonType: "long",
          description: "文件大小"
        },
        metadata: {
          bsonType: "object",
          description: "文件元数据"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间"
        }
      }
    }
  }
});

// 创建实时协作集合
db.createCollection("collaboration_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["project_id", "participants"],
      properties: {
        project_id: {
          bsonType: "long",
          description: "项目ID"
        },
        participants: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["user_id", "joined_at"],
            properties: {
              user_id: { bsonType: "long" },
              username: { bsonType: "string" },
              joined_at: { bsonType: "date" },
              last_seen: { bsonType: "date" },
              cursor_position: { bsonType: "object" }
            }
          },
          description: "参与者列表"
        },
        operations: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              type: { enum: ["insert", "delete", "retain"] },
              position: { bsonType: "int" },
              content: { bsonType: "string" },
              user_id: { bsonType: "long" },
              timestamp: { bsonType: "date" }
            }
          },
          description: "操作记录"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间"
        },
        updated_at: {
          bsonType: "date",
          description: "更新时间"
        }
      }
    }
  }
});

// 创建AI生成缓存集合
db.createCollection("ai_cache", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cache_key", "data", "expires_at"],
      properties: {
        cache_key: {
          bsonType: "string",
          description: "缓存键"
        },
        data: {
          bsonType: "object",
          description: "缓存数据"
        },
        expires_at: {
          bsonType: "date",
          description: "过期时间"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间"
        }
      }
    }
  }
});

// 创建索引
print("Creating indexes...");

// contents集合索引
db.contents.createIndex({ "project_id": 1, "type": 1 });
db.contents.createIndex({ "user_id": 1, "created_at": -1 });
db.contents.createIndex({ "project_id": 1, "updated_at": -1 });
db.contents.createIndex({ "type": 1, "created_at": -1 });

// content_versions集合索引
db.content_versions.createIndex({ "content_id": 1, "version": -1 });
db.content_versions.createIndex({ "created_by": 1, "created_at": -1 });

// media_files集合索引
db.media_files.createIndex({ "project_id": 1, "filename": 1 });
db.media_files.createIndex({ "user_id": 1, "created_at": -1 });
db.media_files.createIndex({ "mime_type": 1 });

// collaboration_sessions集合索引
db.collaboration_sessions.createIndex({ "project_id": 1 }, { unique: true });
db.collaboration_sessions.createIndex({ "participants.user_id": 1 });
db.collaboration_sessions.createIndex({ "updated_at": -1 });

// ai_cache集合索引
db.ai_cache.createIndex({ "cache_key": 1 }, { unique: true });
db.ai_cache.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

// 插入示例数据
print("Inserting sample data...");

// 示例内容数据
db.contents.insertMany([
  {
    project_id: NumberLong(1),
    user_id: NumberLong(1),
    type: "text",
    title: "示例文章",
    data: {
      content: "这是一个示例文章的内容。YouCreator.AI 是一个强大的AI创作平台...",
      word_count: 50,
      language: "zh-CN"
    },
    metadata: {
      tags: ["示例", "AI", "创作"],
      category: "文章"
    },
    version: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    project_id: NumberLong(2),
    user_id: NumberLong(1),
    type: "image",
    title: "AI生成图像",
    data: {
      prompt: "一个美丽的日落风景",
      width: 512,
      height: 512,
      model: "stable-diffusion-v1-5"
    },
    metadata: {
      tags: ["风景", "日落", "AI生成"],
      style: "写实"
    },
    version: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    project_id: NumberLong(3),
    user_id: NumberLong(1),
    type: "code",
    title: "Python示例代码",
    data: {
      language: "python",
      code: "def hello_world():\n    print('Hello, YouCreator.AI!')\n\nhello_world()",
      lines: 4
    },
    metadata: {
      tags: ["Python", "示例", "函数"],
      complexity: "简单"
    },
    version: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print("MongoDB initialization completed successfully!");

// 显示集合信息
print("\nCreated collections:");
db.getCollectionNames().forEach(function(collection) {
  print("- " + collection);
});

print("\nDatabase initialization completed!");
