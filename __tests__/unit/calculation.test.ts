import { getSkip } from "../../src/controllers/CommentController";

describe("Calculation functions", () => {
  it("should return the index jump in the database according to the page to be displayed", () => {
    let page = "0";
    expect(getSkip(page)).toBe(0);

    page = "1";
    expect(getSkip(page)).toBe(50);

    page = "3";
    expect(getSkip(page)).toBe(150);
  });
});
