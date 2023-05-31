const request = require("supertest");
const app = require("./server");

describe("Test the root path", () => {
  test("It should respond to the GET method", async () => {
    const response = await request(app).get("/shapes?rows=500&test=true");
    expect(response.statusCode).toBe(200);
  });
});
