--
-- PostgreSQL database dump
--

\restrict 7YCeFMWk5KPTlCDPbfWw0J4wbBehIJaeuNCcGuHrxC2S5UjoDICufAxMv0A1QeH

-- Dumped from database version 18.3 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.services_skills DROP CONSTRAINT IF EXISTS services_skills_skills_id_fkey;
ALTER TABLE IF EXISTS ONLY public.services_skills DROP CONSTRAINT IF EXISTS services_skills_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.barbers DROP CONSTRAINT IF EXISTS fk_barbers_user;
ALTER TABLE IF EXISTS ONLY public.barber_skills DROP CONSTRAINT IF EXISTS barber_skills_skill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.barber_skills DROP CONSTRAINT IF EXISTS barber_skills_barber_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_barber_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment_services DROP CONSTRAINT IF EXISTS appointment_services_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment_services DROP CONSTRAINT IF EXISTS appointment_services_appointment_id_fkey;
DROP INDEX IF EXISTS public.idx_notifications_user;
DROP INDEX IF EXISTS public.idx_appointments_user_id;
DROP INDEX IF EXISTS public.idx_appointments_barber_date;
DROP INDEX IF EXISTS public.idx_appointment_services_appointment;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_phone_number_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_firebase_uid_key;
ALTER TABLE IF EXISTS ONLY public.barbers DROP CONSTRAINT IF EXISTS unique_barber_user;
ALTER TABLE IF EXISTS ONLY public.skills DROP CONSTRAINT IF EXISTS skills_pkey;
ALTER TABLE IF EXISTS ONLY public.skills DROP CONSTRAINT IF EXISTS skills_name_key;
ALTER TABLE IF EXISTS ONLY public.services_skills DROP CONSTRAINT IF EXISTS services_skills_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.barbers DROP CONSTRAINT IF EXISTS barbers_pkey;
ALTER TABLE IF EXISTS ONLY public.barber_skills DROP CONSTRAINT IF EXISTS barber_skills_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.appointment_services DROP CONSTRAINT IF EXISTS appointment_services_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.skills ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.services ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.barbers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.skills_id_seq;
DROP TABLE IF EXISTS public.skills;
DROP TABLE IF EXISTS public.services_skills;
DROP SEQUENCE IF EXISTS public.services_id_seq;
DROP TABLE IF EXISTS public.services;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.barbers_id_seq;
DROP TABLE IF EXISTS public.barbers;
DROP TABLE IF EXISTS public.barber_skills;
DROP SEQUENCE IF EXISTS public.appointments_id_seq;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.appointment_services;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: tsingtseng
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO tsingtseng;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: tsingtseng
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_services (
    appointment_id integer NOT NULL,
    service_id integer NOT NULL,
    price_at_booking numeric(10,2) NOT NULL
);


ALTER TABLE public.appointment_services OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    barber_id integer NOT NULL,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    notes text,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    CONSTRAINT check_status_values CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: barber_skills; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.barber_skills (
    barber_id integer NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.barber_skills OWNER TO tsingtseng;

--
-- Name: barbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barbers (
    id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.barbers OWNER TO postgres;

--
-- Name: barbers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.barbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.barbers_id_seq OWNER TO postgres;

--
-- Name: barbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.barbers_id_seq OWNED BY public.barbers.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(100) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO tsingtseng;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: tsingtseng
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO tsingtseng;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsingtseng
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    service_name text NOT NULL,
    price numeric(10,2) NOT NULL,
    minutes_duration integer NOT NULL,
    is_active boolean DEFAULT true,
    description text,
    CONSTRAINT check_positive_duration CHECK ((minutes_duration > 0)),
    CONSTRAINT check_positive_price CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: services_skills; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.services_skills (
    service_id integer NOT NULL,
    skill_id integer CONSTRAINT services_skills_skills_id_not_null NOT NULL
);


ALTER TABLE public.services_skills OWNER TO tsingtseng;

--
-- Name: skills; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.skills OWNER TO tsingtseng;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: tsingtseng
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO tsingtseng;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsingtseng
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone_number character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    supabase_uid character varying(128),
    role character varying(20) DEFAULT 'Customer'::character varying,
    photo_url text,
    email_notifications boolean DEFAULT true,
    in_app_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT true,
    CONSTRAINT check_role_values CHECK (((role)::text = ANY ((ARRAY['Customer'::character varying, 'Barber'::character varying, 'Admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: barbers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers ALTER COLUMN id SET DEFAULT nextval('public.barbers_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: appointment_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.appointment_services VALUES (81, 2, 40.00);
INSERT INTO public.appointment_services VALUES (82, 2, 40.00);
INSERT INTO public.appointment_services VALUES (83, 3, 90.00);
INSERT INTO public.appointment_services VALUES (84, 2, 40.00);
INSERT INTO public.appointment_services VALUES (84, 3, 90.00);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.appointments VALUES (81, 39, 14, '2026-10-07', '09:30:00', 'Looking for some advice on growing it out a bit longer.', 'cancelled');
INSERT INTO public.appointments VALUES (82, 39, 12, '2026-09-30', '13:00:00', 'I need an advice for beard length also.', 'scheduled');
INSERT INTO public.appointments VALUES (83, 39, 12, '2026-11-02', '09:30:00', '', 'scheduled');
INSERT INTO public.appointments VALUES (84, 35, 12, '2026-10-14', '10:00:00', '', 'cancelled');


--
-- Data for Name: barber_skills; Type: TABLE DATA; Schema: public; Owner: tsingtseng
--

INSERT INTO public.barber_skills VALUES (12, 1);
INSERT INTO public.barber_skills VALUES (12, 2);
INSERT INTO public.barber_skills VALUES (12, 3);
INSERT INTO public.barber_skills VALUES (12, 4);
INSERT INTO public.barber_skills VALUES (12, 5);
INSERT INTO public.barber_skills VALUES (12, 6);
INSERT INTO public.barber_skills VALUES (12, 7);
INSERT INTO public.barber_skills VALUES (12, 8);
INSERT INTO public.barber_skills VALUES (12, 9);
INSERT INTO public.barber_skills VALUES (13, 1);
INSERT INTO public.barber_skills VALUES (13, 2);
INSERT INTO public.barber_skills VALUES (13, 3);
INSERT INTO public.barber_skills VALUES (13, 6);
INSERT INTO public.barber_skills VALUES (13, 8);
INSERT INTO public.barber_skills VALUES (13, 9);
INSERT INTO public.barber_skills VALUES (14, 2);
INSERT INTO public.barber_skills VALUES (14, 3);
INSERT INTO public.barber_skills VALUES (14, 4);
INSERT INTO public.barber_skills VALUES (14, 5);
INSERT INTO public.barber_skills VALUES (14, 7);
INSERT INTO public.barber_skills VALUES (14, 9);


--
-- Data for Name: barbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.barbers VALUES (12, 36);
INSERT INTO public.barbers VALUES (13, 37);
INSERT INTO public.barbers VALUES (14, 38);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: tsingtseng
--

INSERT INTO public.notifications VALUES (33, 39, 'Appointment Scheduled!', 'See you on 2026-10-07 at 09:30!', false, '2026-09-27 21:21:47.150806');
INSERT INTO public.notifications VALUES (34, 39, 'Appointment Scheduled!', 'See you on 2026-09-30 at 13:00!', false, '2026-09-27 21:38:43.704044');
INSERT INTO public.notifications VALUES (35, 39, 'Appointment Scheduled!', 'See you on 2026-11-02 at 09:30!', false, '2026-09-27 21:40:59.733473');
INSERT INTO public.notifications VALUES (36, 35, 'Appointment Scheduled!', 'See you on 2026-10-14 at 10:00!', false, '2026-10-05 10:01:29.515936');


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services VALUES (1, 'Classic Haircut & Fade', 60.00, 40, true, 'Precision cut using scissors and clippers, skin fade, washing, styling, and scalp massage.');
INSERT INTO public.services VALUES (2, 'Beard Grooming & Shape Up', 40.00, 25, true, 'Razor edge alignment, beard trim to desired length, essential oil conditioning, and hot towel.');
INSERT INTO public.services VALUES (3, 'Full VIP Package (Hair + Beard)', 90.00, 60, true, 'Complete haircut, full beard sculpting, hot towel treatment, double wash, and premium styling.');
INSERT INTO public.services VALUES (4, 'Traditional Hot Towel Shave', 50.00, 30, true, 'Classic wet shave with warm lather, steaming towels, and soothing post-shave balm.');
INSERT INTO public.services VALUES (5, 'Kids Haircut (Under 12)', 45.00, 30, true, 'Modern, gentle haircut for kids in a comfortable and friendly setting.');
INSERT INTO public.services VALUES (6, 'Facial Treatment & Black Mask', 40.00, 20, true, 'Deep facial cleanse with steam, peel-off blackhead mask, and moisturizer.');
INSERT INTO public.services VALUES (7, 'Beard Color & Camo', 50.00, 30, true, 'Subtle grey blending and beard tone enhancement for a natural, sharp appearance.');
INSERT INTO public.services VALUES (8, 'Wash, Scalp Massage & Styling', 30.00, 15, true, 'Invigorating shampoo wash, relaxing scalp massage, and expert styling with premium matte paste.');


--
-- Data for Name: services_skills; Type: TABLE DATA; Schema: public; Owner: tsingtseng
--

INSERT INTO public.services_skills VALUES (1, 1);
INSERT INTO public.services_skills VALUES (1, 2);
INSERT INTO public.services_skills VALUES (2, 3);
INSERT INTO public.services_skills VALUES (3, 1);
INSERT INTO public.services_skills VALUES (3, 2);
INSERT INTO public.services_skills VALUES (3, 3);
INSERT INTO public.services_skills VALUES (3, 4);
INSERT INTO public.services_skills VALUES (4, 4);
INSERT INTO public.services_skills VALUES (4, 5);
INSERT INTO public.services_skills VALUES (5, 2);
INSERT INTO public.services_skills VALUES (6, 4);
INSERT INTO public.services_skills VALUES (6, 8);
INSERT INTO public.services_skills VALUES (7, 3);
INSERT INTO public.services_skills VALUES (7, 7);
INSERT INTO public.services_skills VALUES (8, 9);


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: tsingtseng
--

INSERT INTO public.skills VALUES (1, 'Skin Fade');
INSERT INTO public.skills VALUES (2, 'Classic Scissor Cut');
INSERT INTO public.skills VALUES (3, 'Beard Shaping');
INSERT INTO public.skills VALUES (4, 'Hot Towel Ritual');
INSERT INTO public.skills VALUES (5, 'Traditional Wet Shave');
INSERT INTO public.skills VALUES (6, 'Hair Tattoo & Design');
INSERT INTO public.skills VALUES (7, 'Beard Camo / Coloring');
INSERT INTO public.skills VALUES (8, 'Black Mask & Facial');
INSERT INTO public.skills VALUES (9, 'Scalp Massage');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (35, 'Gabriel', 'Miller', '+40740111111', 'admin@cuthut.com', '2026-09-27 20:56:10.044442', 'a1ab0e3d-cb5b-432e-bce9-48db58a00f7e', 'Admin', NULL, true, true, true);
INSERT INTO public.users VALUES (39, 'Ethan', 'Davis', '+40750555555', 'ethan.davis@cuthut.com', '2026-09-27 21:03:26.821511', '4e78aeb2-6470-4464-8f72-37fe5c7f6a7d', 'Customer', NULL, true, true, true);
INSERT INTO public.users VALUES (36, 'Jack', 'Carter', '+40740222222', 'jack.carter@cuthut.com', '2026-09-27 20:57:31.358837', '2c8980dd-d74e-4e16-93a6-416ad086c08c', 'Barber', NULL, true, true, true);
INSERT INTO public.users VALUES (37, 'Oliver', 'Hayes', '+40740333333', 'oliver.hayes@cuthut.com', '2026-09-27 21:01:32.339651', 'dfbdc9c1-177b-4d09-9340-bdca458e7a32', 'Barber', NULL, true, true, true);
INSERT INTO public.users VALUES (38, 'Leo', 'Brooks', '+40740444444', 'leo.brooks@cuthut.com', '2026-09-27 21:02:12.704701', 'cbea2a77-bb83-4377-a0aa-0e6291253864', 'Barber', NULL, true, true, true);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 84, true);


--
-- Name: barbers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.barbers_id_seq', 14, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tsingtseng
--

SELECT pg_catalog.setval('public.notifications_id_seq', 36, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 10, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tsingtseng
--

SELECT pg_catalog.setval('public.skills_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 39, true);


--
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (appointment_id, service_id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: barber_skills barber_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.barber_skills
    ADD CONSTRAINT barber_skills_pkey PRIMARY KEY (barber_id, skill_id);


--
-- Name: barbers barbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services_skills services_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.services_skills
    ADD CONSTRAINT services_skills_pkey PRIMARY KEY (service_id, skill_id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: barbers unique_barber_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT unique_barber_user UNIQUE (user_id);


--
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (supabase_uid);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_appointment_services_appointment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_appointment ON public.appointment_services USING btree (appointment_id);


--
-- Name: idx_appointments_barber_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_barber_date ON public.appointments USING btree (barber_id, appointment_date, status);


--
-- Name: idx_appointments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_user_id ON public.appointments USING btree (user_id);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: tsingtseng
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: barber_skills barber_skills_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.barber_skills
    ADD CONSTRAINT barber_skills_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE CASCADE;


--
-- Name: barber_skills barber_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.barber_skills
    ADD CONSTRAINT barber_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: barbers fk_barbers_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT fk_barbers_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: services_skills services_skills_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.services_skills
    ADD CONSTRAINT services_skills_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services_skills services_skills_skills_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.services_skills
    ADD CONSTRAINT services_skills_skills_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: tsingtseng
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 7YCeFMWk5KPTlCDPbfWw0J4wbBehIJaeuNCcGuHrxC2S5UjoDICufAxMv0A1QeH

