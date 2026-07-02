import articlesData from "../../../data/articlesData.json";
export async function GET(request: Request) {
  //replace with db call
  const articles = articlesData;
  return new Response(JSON.stringify(articles), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
