import React from "react";
import {
    Box,
    Container,
    Row,
    Column,
    FooterLink,
    Heading,
} from "./footerstyle";

const Footer = () => {
    return (
        <Box>
            <h1 style={{
                color: "green",
                textAlign: "center",
                marginTop: "-50px"
            }}>
                Oncle Tony: React Chess
            </h1>
            <Container>
                <Row>
                    <Column>
                        <Heading>Source codes</Heading>
                        <FooterLink href="https://github.com/delioff/ChessReact">Public repo</FooterLink>
                        <FooterLink href="https://www.geeksforgeeks.org/how-to-create-a-simple-responsive-footer-in-react-js/">Foother sample</FooterLink>
                        <FooterLink href="https://blog.logrocket.com/8-ways-to-deploy-a-react-app-for-free/">How to deploy for free</FooterLink>
                        <FooterLink href="https://github.com/ocastroa/react-tictactoe">Realtime Tic Tac Toe Game in React</FooterLink>
                        <FooterLink href="https://github.com/3stbn/react-chess">Chess multiplayer</FooterLink>
                    </Column>
                    <Column>
                        <Heading>Services</Heading>
                        <FooterLink href="https://www.pubnub.com/blog/how-to-build-live-chat-for-customer-support-in-react/">Live Chat in React</FooterLink>
                        <FooterLink href="https://www.pubnub.com/blog/react-chat-components-beta-build-chat-experiences/">PubNub Tutorial </FooterLink>
                        <FooterLink href="https://reactjs.org/tutorial/tutorial.html">Getting start React</FooterLink>
                    </Column>
                    <Column>
                        <Heading>Libraries</Heading>
                        <FooterLink href="https://libraries.io/npm/chess.js">chess.js 0.12.0</FooterLink>
                        <FooterLink href="https://reactjs.org/">React</FooterLink>
                    </Column>
                    <Column>
                        <Heading>Social Media</Heading>
                        <FooterLink href="https://www.facebook.com/delioff">
                            <i className="fab fa-facebook-f">
                                <span style={{ marginLeft: "10px" }}>
                                    Facebook
                                </span>
                            </i>
                        </FooterLink>
                        <FooterLink href="https://www.instagram.com/antontakov/">
                            <i className="fab fa-instagram">
                                <span style={{ marginLeft: "10px" }}>
                                    Instagram
                                </span>
                            </i>
                        </FooterLink>
                        {/*<FooterLink href="#">*/}
                        {/*    <i className="fab fa-twitter">*/}
                        {/*        <span style={{ marginLeft: "10px" }}>*/}
                        {/*            Twitter*/}
                        {/*        </span>*/}
                        {/*    </i>*/}
                        {/*</FooterLink>*/}
                        {/*<FooterLink href="#">*/}
                        {/*    <i className="fab fa-youtube">*/}
                        {/*        <span style={{ marginLeft: "10px" }}>*/}
                        {/*            Youtube*/}
                        {/*        </span>*/}
                        {/*    </i>*/}
                        {/*</FooterLink>*/}
                    </Column>
                </Row>
            </Container>
        </Box>
    );
};
export default Footer;