/** Both `Too Many Requests` and `Request Timeout` statuses are retryable. */
const RETRYABLE_STATUSES = [408, 429];

/** Checks if jQuery ajax returns a response with a retryable status. */
function hasRetryableStatus(jqXHR: JQueryXHR): boolean {
  return (
    RETRYABLE_STATUSES.includes(jqXHR.status) ||
    (jqXHR.status >= 500 && jqXHR.status <= 599)
  );
}

export default hasRetryableStatus;
