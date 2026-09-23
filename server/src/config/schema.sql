--
-- PostgreSQL database dump
--

\restrict x5i3Mvy9z3pJYcySgeubGE2Vfnic2Q63z9SKGhWwBupXVl26fLlUu9P2ponpk46

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
    firebase_uid character varying(128),
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
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


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

\unrestrict x5i3Mvy9z3pJYcySgeubGE2Vfnic2Q63z9SKGhWwBupXVl26fLlUu9P2ponpk46

