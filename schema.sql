-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,                  -- 'procurement' or 'development'
    status INTEGER NOT NULL DEFAULT 1,   -- 1, 2, 3...
    isClosed BOOLEAN NOT NULL DEFAULT 0, -- 0 for false, 1 for true
    customData TEXT DEFAULT '{}',        -- Stores state-specific JSON payload 
    assignedUserId INTEGER,
    FOREIGN KEY (assignedUserId) REFERENCES Users(id) ON DELETE SET NULL
);

-- 3. Seed Demo Users (This is what the interviewer wants to see)
INSERT INTO Users (name) VALUES ('Alice Smith');
INSERT INTO Users (name) VALUES ('Bob Jones');
INSERT INTO Users (name) VALUES ('Charlie Brown');

-- 4. Seed Initial Tasks (Optional, but shows the app in action)
INSERT INTO Tasks (title, type, status, isClosed, customData, assignedUserId) 
VALUES (
    'Order New Office Laptops', 
    'procurement', 
    1, 
    0, 
    '{}', 
    1
);

INSERT INTO Tasks (title, type, status, isClosed, customData, assignedUserId) 
VALUES (
    'Refactor Auth Middleware', 
    'development', 
    1, 
    0, 
    '{}', 
    2
);