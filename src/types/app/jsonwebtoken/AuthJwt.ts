import { JwtPayload } from "jsonwebtoken";

export default interface AuthJwt extends JwtPayload {
  id: number;
  username: string;

  // Inherited from JwtPayload
  [key: string]: any;

  aud: string | string[] | undefined;
  exp: number | undefined;
  iat: number | undefined;
  iss: string | undefined;
  jti: string | undefined;
  nbf: number | undefined;
  sub: string | undefined;
}
