import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  AuthLayout,
  handleSignIn,
  registerValidationSchema,
} from "~/components/auth";
import { api } from "~/utils/api";

import { zodResolver } from "@hookform/resolvers/zod";

import { type z } from "zod";

type RegisterValidationSchema = z.infer<typeof registerValidationSchema>;

const Register = () => {
  const [loginPassword, setLoginPassword] = useState("");
  const router = useRouter();
  const mutation = api.register.createUser.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValidationSchema>({
    resolver: zodResolver(registerValidationSchema),
  });

  const onSubmit: SubmitHandler<RegisterValidationSchema> = ({
    username,
    email,
    password,
  }) => {
    mutation.mutate({ username, email, password });
    setLoginPassword(password);
  };

  if (mutation.isSuccess) {
    void handleSignIn(mutation.data.email!, loginPassword).then((status) => {
      if (status?.ok) void router.push("/");
    });
  }

  return (
    <AuthLayout>
      <Head>
        <title>Register</title>
      </Head>

      <form
        className="flex w-full flex-col items-center justify-center   p-4 text-center"
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
            <p className="mx-auto w-3/4 text-xl text-secondary">Register</p>
          </div>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className={`auth_input ${errors.username && "border-error"}`}
                  placeholder="Username"
                  {...register("username")}
                />

                {errors.username && (
                  <p className="auth_input_error">{errors.username?.message}</p>
                )}
              </div>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className={`auth_input ${errors.email && "border-error"}`}
                  placeholder="Email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="auth_input_error">{errors.email?.message}</p>
                )}
              </div>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  className={`auth_input ${errors.password && "border-error"}`}
                  placeholder="Password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="auth_input_error">{errors.password?.message}</p>
                )}
              </div>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  className={`auth_input ${
                    errors.confirmPassword && "border-error"
                  }`}
                  placeholder="Confirm"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="auth_input_error">
                    {errors.confirmPassword?.message}
                  </p>
                )}
              </div>
            </div>
            <button className="btn btn-primary mt-5 w-full" type="submit">
              Register
            </button>
          </div>

          <p className="text-center text-secondary ">
            Have an account?{" "}
            <Link href={"/login"} className="text-info">
              Sign in
            </Link>
          </p>
          {mutation.error && (
            <span className="text-error">{mutation.error.message}</span>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;

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
