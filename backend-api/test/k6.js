import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

// Custom metrics to count different types of responses
const successfulRequests = new Counter("http_200_responses");
const rateLimitedRequests = new Counter("http_429_responses");
const otherErrorRequests = new Counter("http_other_error_responses");

export const options = {
  vus: 1, // Use a single virtual user
  iterations: 1, // Run the default function exactly once
  duration: "60s", // Maximum time for the single iteration to complete (acts as a timeout)
  thresholds: {
    // We expect the first 10 requests to be successful (200 OK).
    http_200_responses: ["count>=10", "count<=11"],
    // We expect to trigger the rate limit for the 11th, 12th and 13th requests.
    http_429_responses: ["count>=2", "count<=3"],
    // Ideally, no other HTTP errors
    http_other_error_responses: ["count==0"],
    // Standard k6 check: less than 1% of requests should fail due to network issues etc.
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const totalRequestsToSend = 13; // Send 13 requests in total
  // To test a limit of 10 req/min (1 req/6s), we send requests slightly faster:
  // 1 req/3s = 20 req/min.
  const intervalSeconds = 3;
  const targetUrl = "http://localhost:3000/";

  console.log(
    `Starting test: Will send ${totalRequestsToSend} requests to ${targetUrl}, 1 every ${intervalSeconds} seconds.`
  );

  for (let i = 1; i <= totalRequestsToSend; i++) {
    const requestStartTime = new Date().getTime();
    // Tell k6 that 200 and 429 are expected statuses for this request
    // This prevents 429s from incrementing http_req_failed
    const res = http.get(targetUrl, {
      responseCallback: http.expectedStatuses(200, 429),
    });
    const requestEndTime = new Date().getTime();
    const requestDurationMs = requestEndTime - requestStartTime;

    // Log details for each request
    console.log(
      `VU: ${__VU}, Iter: ${__ITER}, Request: ${i}/${totalRequestsToSend}, URL: ${targetUrl}, Status: ${res.status}, Latency: ${requestDurationMs}ms`
    );

    // Increment counters based on response status
    if (res.status === 200) {
      successfulRequests.add(1);
    } else if (res.status === 429) {
      rateLimitedRequests.add(1);
    } else if (res.status !== 0 && res.status >= 400) {
      // This block will now catch unexpected errors (e.g., 500, 400, 401, 403 etc.)
      // because 429 is handled by the rateLimitedRequests counter and expectedStatuses
      otherErrorRequests.add(1);
      console.warn(
        `Request ${i} to ${targetUrl} received unexpected status: ${res.status}`
      );
    } else if (res.status === 0) {
      console.error(
        `Request ${i} to ${targetUrl} failed to send (status 0). Check connectivity or server logs.`
      );
    }

    // A general check for each request to ensure it's one of the expected statuses
    // This check remains useful as a direct assertion in your script's logic.
    check(res, {
      "response is 200 (OK) or 429 (Too Many Requests)": (r) =>
        r.status === 200 || r.status === 429,
    });

    // Sleep between requests, but not after the last one in this VU's iteration
    if (i < totalRequestsToSend) {
      sleep(intervalSeconds);
    }
  }
  console.log(
    `Finished sending ${totalRequestsToSend} requests to ${targetUrl}.`
  );
}
