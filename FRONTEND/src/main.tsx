```typescript
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { useState } from "react";

// Assuming we use a library like react-hook-form and some UI framework for validation
import { useForm } from "react-hook-form";
import { ValidationError } from "@hookform/resolvers/yup"; // Example validation resolver
import * as yup from "yup"; // for schema validation

// Define a validation schema using Yup
const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required")
});

function ProfileForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = (data: any) => {
    // Logic to submit the form data
    console.log("Form Data Submitted", data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register("name")} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

createRoot(document.getElementById("root")!).render(
  <div>
    <App />
    <ProfileForm />
  </div>
);

```