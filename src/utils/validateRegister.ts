import { RegisterInput } from "../resolvers/inputs/RegisterInput"

export const validateRegister = (options: RegisterInput) => {
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Length must be greater than 2"
      }
    ]
  }
  if (options.username.includes('@')) {
    return [
      {
        field: "username",
        message: "Can't include @"
      }
    ]
  }
  if (options.email.length <= 2) {
    return [
      {
        field: "email",
        message: "Length must be greater than 2"
      }
    ]
  }
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Wrong email format"
      }
    ]
  }
  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "Length must be greater than 2"
      }
    ]
  }

  return null;
}