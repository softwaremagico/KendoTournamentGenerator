package com.softwaremagico.kt.websockets;

import com.softwaremagico.kt.persistence.entities.AuthenticatedUser;
import com.softwaremagico.kt.rest.controllers.AuthenticatedUserController;
import com.softwaremagico.kt.rest.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.lang.reflect.Type;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.awaitility.Awaitility.await;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT)
@Test(groups = "websockets")
@AutoConfigureMockMvc(addFilters = false)
public class BasicWebsocketsTests extends AbstractTestNGSpringContextTests {

    private final static String USER_FIRST_NAME = "Test";
    private final static String USER_LAST_NAME = "User";

    private static final String USER_NAME = USER_FIRST_NAME + "." + USER_LAST_NAME;
    private static final String USER_PASSWORD = "password";
    private static final String[] USER_ROLES = new String[]{"admin", "viewer"};

    private static final String TESTING_MESSAGE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus iaculis leo purus, vitae finibus felis fringilla eget.";

    @LocalServerPort
    private Integer port;

    @Autowired
    private AuthenticatedUserController authenticatedUserController;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private WebSocketStompClient webSocketStompClient;

    private WebSocketHttpHeaders headers;


    private String getWsPath() {
        return String.format("ws://127.0.0.1:%d/kendo-tournament-backend/%s", port, WebSocketConfiguration.SOCKET_RECEIVE_PREFIX);
    }

    @BeforeClass
    public void authentication() {
       AuthenticatedUser authenticatedUser = authenticatedUserController.createUser(null, USER_NAME, USER_FIRST_NAME, USER_LAST_NAME, USER_PASSWORD, USER_ROLES);

        headers = new WebSocketHttpHeaders();
        headers.set("Authorization", "Bearer " + jwtTokenUtil.generateAccessToken(authenticatedUser, "127.0.0.1"));
    }


    @BeforeMethod
    public void setup() throws ExecutionException, InterruptedException, TimeoutException {
        WebSocketClient webSocketClient = new StandardWebSocketClient();
        this.webSocketStompClient = new WebSocketStompClient(webSocketClient);
        this.webSocketStompClient.setMessageConverter(new MappingJackson2MessageConverter());

//        webSocketStompClient = new WebSocketStompClient(new SockJsClient(
//                List.of(new WebSocketTransport(new StandardWebSocketClient()))));
//
//        StompSession session = webSocketStompClient.connectAsync(getWsPath(),
//                new StompSessionHandlerAdapter() {
//                }).get(1, TimeUnit.SECONDS);
//
//        webSocketStompClient.setMessageConverter(new StringMessageConverter());
    }


    @Test
    public void echoTest() throws ExecutionException, InterruptedException, TimeoutException {
        BlockingQueue<String> blockingQueue = new ArrayBlockingQueue<>(1);

        StompSession session = webSocketStompClient.connectAsync(getWsPath(), this.headers,
                new StompSessionHandlerAdapter() {
                }).get(1, TimeUnit.SECONDS);

        session.subscribe("/topic/greetings", new StompFrameHandler() {

            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.add((String) payload);
            }
        });

        session.send("/app/welcome", TESTING_MESSAGE);

        await().atMost(1, TimeUnit.SECONDS)
                .untilAsserted(() -> Assert.assertEquals("Hello, Mike!", blockingQueue.poll()));
    }

}
