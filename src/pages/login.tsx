import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import {
  AuthLayout,
  handleGoogleSignIn,
  handleSignIn,
  loginValidationSchema,
} from "~/components/auth";

type LoginValidationSchema = z.infer<typeof loginValidationSchema>;

const Login = () => {
  const [show, setShow] = useState(false);
  const [databaseErrors, setDatabaseErrors] = useState("");

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValidationSchema>({
    resolver: zodResolver(loginValidationSchema),
  });

  const onSubmit: SubmitHandler<LoginValidationSchema> = ({
    email,
    password,
  }) => login(email, password);

  const login = async (email: string, password: string) => {
    const status = await handleSignIn(email, password);

    if (status?.ok) {
      void router.push("/");
    }
    if (status?.error) {
      setDatabaseErrors("Incorrect Email and/or Password");
    }
  };

  return (
    <AuthLayout>
      <Head>
        <title>Login</title>
      </Head>
      <form
        className="flex w-full flex-col items-center justify-center p-4 text-center"
        //Linter Issue with React Hook Forms
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col justify-center space-y-9 ">
          <div className="flex flex-col items-center justify-center">
            <Image
              className="ml-5"
              src="/assets/analysisBank.svg"
              alt="Trade Desk"
              width={200}
              height={200}
            />
            <h1 className="py-4 text-4xl font-bold text-primary">
              Trade Co-Pilot
            </h1>
            <p className="mx-auto w-3/4 text-secondary">
              Take the guessing out of trading
            </p>
          </div>
          <div className="relative w-full focus:stroke-red-500 lg:w-[28rem]">
            <input
              type="email"
              className="auth_input"
              placeholder="Email"
              {...register("email")}
            />
            <span className="absolute right-6 top-3 focus:stroke-red-500">
              {/* React Heroicons @ Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
                />
              </svg>
            </span>
            {errors.email && (
              <p className="auth_input_error">{errors.email?.message}</p>
            )}
          </div>
          <div className="relative w-full lg:w-[28rem]">
            <input
              type={`${show ? "text" : "password"}`}
              className="auth_input"
              placeholder="Password"
              {...register("password")}
            />
            <span className="absolute right-6 top-3">
              {/* React Heroicons Finger Print */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 hover:stroke-info"
                onClick={() => setShow(!show)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                />
              </svg>
            </span>
            {errors.password && (
              <p className="auth_input_error">{errors.password?.message}</p>
            )}
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Login
          </button>
          <button
            onClick={() => void handleGoogleSignIn()}
            className="btn btn-ghost mt-4"
            type="button"
          >
            Sign in with Google
            <span className="">
              {/* React Heroicons */}
              <Image
                className=""
                src="/assets/googleIcon.svg"
                alt="Google Icon"
                width={20}
                height={20}
              />
            </span>
          </button>
          <p className="text-center text-secondary">
            don&apos;t have an account yet?{" "}
            <Link href={"/register"} className="text-info">
              Sign Up
            </Link>
          </p>
          {databaseErrors && (
            <span className="text-error">{databaseErrors}</span>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
