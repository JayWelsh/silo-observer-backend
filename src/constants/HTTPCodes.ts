/**
 * Informational
 */
 const HTTP_CONTINUE = 100
 const HTTP_SWITCHING_PROTOCOLS = 101
 const HTTP_PROCESSING = 102            // RFC2518
 
 /**
  * Success
  */
 const HTTP_OK = 200
 const HTTP_CREATED = 201
 const HTTP_ACCEPTED = 202
 const HTTP_NON_AUTHORITATIVE_INFORMATION = 203
 const HTTP_NO_CONTENT = 204
 const HTTP_RESET_CONTENT = 205
 const HTTP_PARTIAL_CONTENT = 206
 const HTTP_MULTI_STATUS = 207          // RFC4918
 const HTTP_ALREADY_REPORTED = 208      // RFC5842
 const HTTP_IM_USED = 226               // RFC3229
 
 /**
  * Redirection
  */
 const HTTP_MULTIPLE_CHOICES = 300
 const HTTP_MOVED_PERMANENTLY = 301
 const HTTP_FOUND = 302
 const HTTP_SEE_OTHER = 303
 const HTTP_NOT_MODIFIED = 304
 const HTTP_USE_PROXY = 305
 const HTTP_RESERVED = 306
 const HTTP_TEMPORARY_REDIRECT = 307
 const HTTP_PERMANENTLY_REDIRECT = 308  // RFC7238
 
 /**
  * Client Error
  */
 const HTTP_BAD_REQUEST = 400
 const HTTP_UNAUTHORIZED = 401
 const HTTP_PAYMENT_REQUIRED = 402
 const HTTP_FORBIDDEN = 403
 /**
  * The requested resource could not be found
  *
  * Note: This is sometimes used to mask if there was an UNAUTHORIZED (401) or
  * FORBIDDEN (403) error, for security reasons
  */
 const HTTP_NOT_FOUND = 404
 const HTTP_METHOD_NOT_ALLOWED = 405
 const HTTP_NOT_ACCEPTABLE = 406
 const HTTP_PROXY_AUTHENTICATION_REQUIRED = 407
 const HTTP_REQUEST_TIMEOUT = 408
 const HTTP_CONFLICT = 409
 const HTTP_GONE = 410
 const HTTP_LENGTH_REQUIRED = 411
 const HTTP_PRECONDITION_FAILED = 412
 const HTTP_REQUEST_ENTITY_TOO_LARGE = 413
 const HTTP_REQUEST_URI_TOO_LONG = 414
 const HTTP_UNSUPPORTED_MEDIA_TYPE = 415
 const HTTP_REQUESTED_RANGE_NOT_SATISFIABLE = 416
 const HTTP_EXPECTATION_FAILED = 417
 const HTTP_I_AM_A_TEAPOT = 418                                               // RFC2324
 const HTTP_UNPROCESSABLE_ENTITY = 422                                        // RFC4918
 const HTTP_LOCKED = 423                                                      // RFC4918
 const HTTP_FAILED_DEPENDENCY = 424                                           // RFC4918
 const HTTP_RESERVED_FOR_WEBDAV_ADVANCED_COLLECTIONS_EXPIRED_PROPOSAL = 425   // RFC2817
 const HTTP_UPGRADE_REQUIRED = 426                                            // RFC2817
 const HTTP_PRECONDITION_REQUIRED = 428                                       // RFC6585
 const HTTP_TOO_MANY_REQUESTS = 429                                           // RFC6585
 const HTTP_REQUEST_HEADER_FIELDS_TOO_LARGE = 431                             // RFC6585
 
 /**
  * The server encountered an unexpected error
  */
 const HTTP_INTERNAL_SERVER_ERROR = 500
 const HTTP_NOT_IMPLEMENTED = 501
 const HTTP_BAD_GATEWAY = 502
 const HTTP_SERVICE_UNAVAILABLE = 503
 const HTTP_GATEWAY_TIMEOUT = 504
 const HTTP_VERSION_NOT_SUPPORTED = 505
 const HTTP_VARIANT_ALSO_NEGOTIATES_EXPERIMENTAL = 506                        // RFC2295
 const HTTP_INSUFFICIENT_STORAGE = 507                                        // RFC4918
 const HTTP_LOOP_DETECTED = 508                                               // RFC5842
 const HTTP_NOT_EXTENDED = 510                                                // RFC2774
 const HTTP_NETWORK_AUTHENTICATION_REQUIRED = 511
 
export {
    HTTP_CONTINUE,
    HTTP_SWITCHING_PROTOCOLS,
    HTTP_PROCESSING,
    HTTP_OK,
    HTTP_CREATED,
    HTTP_ACCEPTED,
    HTTP_NON_AUTHORITATIVE_INFORMATION,
    HTTP_NO_CONTENT,
    HTTP_RESET_CONTENT,
    HTTP_PARTIAL_CONTENT,
    HTTP_MULTI_STATUS,
    HTTP_ALREADY_REPORTED,
    HTTP_IM_USED,
    HTTP_MULTIPLE_CHOICES,
    HTTP_MOVED_PERMANENTLY,
    HTTP_FOUND,
    HTTP_SEE_OTHER,
    HTTP_NOT_MODIFIED,
    HTTP_USE_PROXY,
    HTTP_RESERVED,
    HTTP_TEMPORARY_REDIRECT,
    HTTP_PERMANENTLY_REDIRECT,
    HTTP_BAD_REQUEST,
    HTTP_UNAUTHORIZED,
    HTTP_PAYMENT_REQUIRED,
    HTTP_FORBIDDEN,
    HTTP_NOT_FOUND,
    HTTP_METHOD_NOT_ALLOWED,
    HTTP_NOT_ACCEPTABLE,
    HTTP_PROXY_AUTHENTICATION_REQUIRED,
    HTTP_REQUEST_TIMEOUT,
    HTTP_CONFLICT,
    HTTP_GONE,
    HTTP_LENGTH_REQUIRED,
    HTTP_PRECONDITION_FAILED,
    HTTP_REQUEST_ENTITY_TOO_LARGE,
    HTTP_REQUEST_URI_TOO_LONG,
    HTTP_UNSUPPORTED_MEDIA_TYPE,
    HTTP_REQUESTED_RANGE_NOT_SATISFIABLE,
    HTTP_EXPECTATION_FAILED,
    HTTP_I_AM_A_TEAPOT,
    HTTP_UNPROCESSABLE_ENTITY,
    HTTP_LOCKED,
    HTTP_FAILED_DEPENDENCY,
    HTTP_RESERVED_FOR_WEBDAV_ADVANCED_COLLECTIONS_EXPIRED_PROPOSAL,
    HTTP_UPGRADE_REQUIRED,
    HTTP_PRECONDITION_REQUIRED,
    HTTP_TOO_MANY_REQUESTS,
    HTTP_REQUEST_HEADER_FIELDS_TOO_LARGE,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_NOT_IMPLEMENTED,
    HTTP_BAD_GATEWAY,
    HTTP_SERVICE_UNAVAILABLE,
    HTTP_GATEWAY_TIMEOUT,
    HTTP_VERSION_NOT_SUPPORTED,
    HTTP_VARIANT_ALSO_NEGOTIATES_EXPERIMENTAL,
    HTTP_INSUFFICIENT_STORAGE,
    HTTP_LOOP_DETECTED,
    HTTP_NOT_EXTENDED,
    HTTP_NETWORK_AUTHENTICATION_REQUIRED
}
 