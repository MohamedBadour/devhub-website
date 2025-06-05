-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table for access control
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Insert sample data
INSERT INTO events (title, date, time, location, description)
VALUES 
  ('Web Development Workshop', '2025-06-15', '14:00', 'Lab 203', 'Learn the basics of HTML, CSS, and JavaScript.'),
  ('Hackathon 2025', '2025-07-10', '09:00', 'Main Hall', '24-hour coding competition with amazing prizes.'),
  ('AI Study Group', '2025-06-20', '16:00', 'Room 105', 'Weekly meeting to discuss AI concepts and applications.');

INSERT INTO resources (title, url, category, description)
VALUES
  ('JavaScript Fundamentals', 'https://javascript.info/', 'Web Development', 'Comprehensive guide to JavaScript'),
  ('React Documentation', 'https://react.dev/', 'Web Development', 'Official React documentation'),
  ('Python for Data Science', 'https://www.datacamp.com/courses/intro-to-python-for-data-science', 'Data Science', 'Introduction to Python for data analysis');

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- By default, new users are viewers unless explicitly set as admin or editor
  INSERT INTO public.user_roles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
