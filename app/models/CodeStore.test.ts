import { CodeStoreModel } from "./CodeStore"

test("can be created", () => {
  const instance = CodeStoreModel.create({})

  expect(instance).toBeTruthy()
})
