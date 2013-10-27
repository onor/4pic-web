package components

import org.apache.commons.codec.binary.Base64
import play.api.Logger
import play.api.libs.json.Json

case class SignedRequest(user_id: String, oauth_token: String, expires: Int, algorithm: String)

//parses token received from facebook on first request to our app. Via standard facebook/webapp post request.
//todo: use either class and scala.util.try
object SignedRequestUtils {
  def base64UrlDecode(s: String): Array[Byte] = {
    Base64.decodeBase64(s.replace('-', '+').replace('_', '/'))
  }

  def hash_hmac_sha256(s: String, apiSecret: String): Array[Byte] = {
    import javax.crypto.Mac
    import javax.crypto.spec.SecretKeySpec
    try {
      val mac = Mac.getInstance("HmacSHA256");
      val secret = new SecretKeySpec(apiSecret.getBytes(), "HmacSHA256");
      mac.init(secret);
      mac.doFinal(s.getBytes());
    } catch {
      //todo
      case e: Exception => throw new RuntimeException(e)
    }
  }

	//parses https://developers.facebook.com/docs/reference/login/signed-request/
  def parseSignedRequest(signedRequestString: String, appSecret: String) = {
    val fields = signedRequestString.split("\\.", 2)
    val encodedSig = fields(0)
    val payload = fields(1)

    val sig = base64UrlDecode(encodedSig)
    val decodedPayload = new String(base64UrlDecode(payload), "UTF-8")
    Logger.warn("Decoded " + decodedPayload)
    val json = Json.parse(decodedPayload)
    implicit val reads = Json.reads[SignedRequest]
    val signedRequest = reads.reads(json).fold(
      invalid => {
        Logger.error("Invalid Request" + invalid); None
      },
      signed => Some(signed))

    signedRequest.
      filter(_.algorithm == "HMAC-SHA256").
      filter(a => sig sameElements hash_hmac_sha256(payload, appSecret))
  }
}

