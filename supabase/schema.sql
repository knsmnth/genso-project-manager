-- GenSO Project Manager - Complete Supabase Database Schema

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'technician', -- 'admin', 'foreman', 'technician'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(new.raw_user_meta_data->>'role', 'technician')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Work Groups (Teams) Table
CREATE TABLE IF NOT EXISTS public.work_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    lead TEXT NOT NULL,
    size INT DEFAULT 1,
    jobs INT DEFAULT 0,
    members TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Personnel Table
CREATE TABLE IF NOT EXISTS public.personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    attendance_status TEXT DEFAULT 'Absent',
    active_order TEXT DEFAULT '—',
    group_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Work Orders Table
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    asset_name TEXT NOT NULL,
    space TEXT,
    scope TEXT,
    workgroup TEXT,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    worktype TEXT,
    start_date DATE,
    end_date DATE,
    start_time TEXT,
    end_time TEXT,
    foreman TEXT,
    assigned TEXT[] DEFAULT '{}',
    description TEXT,
    work_title TEXT,
    date_received DATE,
    requester_name TEXT,
    requesting_office TEXT,
    room_no TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Daily Work Logs Table
CREATE TABLE IF NOT EXISTS public.daily_work_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_title TEXT NOT NULL,
    group_sub_title TEXT,
    work_order_number TEXT,
    category TEXT,
    work_type TEXT,
    description TEXT,
    start_date DATE,
    completion_date DATE,
    assigned_lead TEXT,
    personnel_count INT DEFAULT 1,
    assigned_personnel TEXT[] DEFAULT '{}',
    inspections_count INT DEFAULT 0,
    has_comments BOOLEAN DEFAULT FALSE,
    is_on_hold BOOLEAN DEFAULT FALSE,
    remarks_list JSONB DEFAULT '[]'::jsonb,
    equipment_list JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Custom Dropdown Options Table
CREATE TABLE IF NOT EXISTS public.custom_dropdown_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- 'category', 'priority', 'team', 'project', 'status'
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(category, value)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_dropdown_options ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for full operational access (Can be tightened per role)
CREATE POLICY "Allow public read access for work_groups" ON public.work_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for work_groups" ON public.work_groups FOR ALL USING (true);

CREATE POLICY "Allow public read access for personnel" ON public.personnel FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for personnel" ON public.personnel FOR ALL USING (true);

CREATE POLICY "Allow public read access for work_orders" ON public.work_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for work_orders" ON public.work_orders FOR ALL USING (true);

CREATE POLICY "Allow public read access for daily_work_logs" ON public.daily_work_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for daily_work_logs" ON public.daily_work_logs FOR ALL USING (true);

CREATE POLICY "Allow public read access for custom_dropdown_options" ON public.custom_dropdown_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for custom_dropdown_options" ON public.custom_dropdown_options FOR ALL USING (true);

CREATE POLICY "Allow users to read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
