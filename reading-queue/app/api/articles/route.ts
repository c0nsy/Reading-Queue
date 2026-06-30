export async function GET(request: Request) {
  //replace with db call
  const articles = [
    {
      id: "1",
      url: "https://globalnews.ca/news/11942308/fifa-world-cup-canada-group-of-32-victory/",
      title: "Canada World Cup",
      status: "unread",
    },
    {
      id: "2",
      url: "https://www.dust2.us/news/75506/true-north-studio-to-host-two-day-750-cad-na-event-in-august",
      title: "Canadian Counter Strike Tournament",
      status: "unread",
    },
  ];
  return new Response(JSON.stringify(articles), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
