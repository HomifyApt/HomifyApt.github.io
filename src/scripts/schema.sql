

-- Collections table to store collection metadata
CREATE TABLE collections (
    collection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id VARCHAR(50) NOT NULL,
    handle VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on app_id for faster lookups
CREATE INDEX idx_collections_app_id ON collections(app_id);
CREATE INDEX idx_collections_handle ON collections(handle);

-- Records table to store furniture records
CREATE TABLE records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    price DECIMAL(10,2),
    status record_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE
);

-- Create an index on collection_id for faster lookups
CREATE INDEX idx_records_collection_id ON records(collection_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at
    BEFORE UPDATE ON records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE collections IS 'Stores collection metadata for each app instance';
COMMENT ON TABLE records IS 'Stores individual furniture records belonging to collections';
COMMENT ON COLUMN collections.app_id IS 'Identifier for the app instance';
COMMENT ON COLUMN collections.handle IS '3-word identifier for sharing';
COMMENT ON COLUMN collections.display_name IS 'User-friendly name for the collection';
COMMENT ON COLUMN records.url IS 'Optional URL link to the furniture record';
COMMENT ON COLUMN records.price IS 'Optional price of the furniture record'; 