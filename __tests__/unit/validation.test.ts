import {
  createValidation,
  updateValidation,
} from "../../src/controllers/ClassController";

describe("Request Body Validation", () => {
  it("should return false if any fields are missing", () => {
    expect(createValidation({})).toBe(false);
    expect(createValidation({ name: "Aula 1" })).toBe(false);
    expect(
      createValidation({
        name: "Aula 1",
        description: "primeira aula",
        video: "youtu.be/test",
        data_init: new Date(),
        data_end: new Date(),
      })
    ).toBe(true);
  });

  it("should return true if any valid fields are submitted", () => {
    expect(updateValidation({})).toBe(false);
    expect(updateValidation({ name: "Aula 1" })).toBe(true);
    expect(
      updateValidation({
        name: "Aula 1",
        description: "primeira aula",
        video: "youtu.be/test",
        data_init: new Date(),
        data_end: new Date(),
      })
    ).toBe(true);
  });
});
