--
-- PostgreSQL database dump
--

\restrict 8jMLNxXfpjMhspd0DX77Zt6GJlq2LH8P8eJe5cBamqj3bVq2CicBzcKwEamo2y0

-- Dumped from database version 18.3 (Postgres.app)
-- Dumped by pg_dump version 18.3 (Postgres.app)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.appointment_services (
    appointment_id integer NOT NULL,
    service_id integer NOT NULL,
    price_at_booking numeric(10,2) NOT NULL
);


ALTER TABLE public.appointment_services OWNER TO tsingtseng;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    barber_id integer NOT NULL,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    notes text,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL
);


ALTER TABLE public.appointments OWNER TO tsingtseng;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: tsingtseng
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO tsingtseng;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsingtseng
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: barbers; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.barbers (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone_number character varying(20) NOT NULL,
    photo_url text,
    specialization text NOT NULL
);


ALTER TABLE public.barbers OWNER TO tsingtseng;

--
-- Name: barbers_id_seq; Type: SEQUENCE; Schema: public; Owner: tsingtseng
--

CREATE SEQUENCE public.barbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.barbers_id_seq OWNER TO tsingtseng;

--
-- Name: barbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsingtseng
--

ALTER SEQUENCE public.barbers_id_seq OWNED BY public.barbers.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.services (
    id integer NOT NULL,
    service_name text NOT NULL,
    price numeric(10,2) NOT NULL,
    minutes_duration integer NOT NULL
);


ALTER TABLE public.services OWNER TO tsingtseng;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: tsingtseng
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO tsingtseng;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsingtseng
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: tsingtseng
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone_number character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    firebase_uid character varying(128)
);


ALTER TABLE public.users OWNER TO tsingtseng;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: tsingtseng
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO tsingtseng;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsingtseng
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: barbers id; Type: DEFAULT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.barbers ALTER COLUMN id SET DEFAULT nextval('public.barbers_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (appointment_id, service_id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: barbers barbers_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_phone_number_key UNIQUE (phone_number);


--
-- Name: barbers barbers_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id);


--
-- Name: appointments appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tsingtseng
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 8jMLNxXfpjMhspd0DX77Zt6GJlq2LH8P8eJe5cBamqj3bVq2CicBzcKwEamo2y0

