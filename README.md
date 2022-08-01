# Soolther Town

# 🙋‍♂️개발한 사람

- [김재민](https://github.com/dev-jaemin) | 고려대학교 컴퓨터학과 18학번
- [조예진](https://github.com/Yejin427) | 한양대학교 컴퓨터소프트웨어학부 20학번
- [구민재](https://github.com/9mande) | KAIST 전산학부 19학번


# 🌐서비스 소개


2D 메타버스 서비스인 [Gather.town](http://Gather.town) 의 회식용 버전입니다.

webRTC 통신을 사용하여 실시간으로 화상 통화를 할 수 있습니다.

또한, 유저끼리 채팅이 가능하고, 채팅을 활용한 4가지의 술 게임도 구현했습니다.
![intro](https://user-images.githubusercontent.com/43535460/182182025-08c19d51-6128-416c-acec-99d68b881e4f.gif)
![info](https://user-images.githubusercontent.com/43535460/182182053-5749e1f6-67d2-420d-81ab-71f914de2cf0.gif)

# 🔥세부 구현 내용
## webRTC를 활용한 다중 화상 통화

- `wrtc` 모듈을 이용해 다중 화상 통화를 구현했습니다.
- 다수의 컴퓨터가 접속해도 클라이언트에서 원활히 작동하도록 `SFU` 방식을 사용했습니다.
- 각 사용자는 서로가 서로의 **Sender**이자 **Receiver**입니다.
- 다음은 `SFU` 방식을 구현하기 위하여 작업했던 단계입니다.

### Room에 사용자가 들어올 때

- 한 사용자가 들어오면, 기존에 방에 있던 사용자들의 정보를 담은 객체 배열(`allUsers`)을 사용자에게 전송합니다.

### Sender의 Offer, Answer(`senderOffer`)

1. `Media Stream`을 서버에 보낼 클라이언트 **Sender**와 **서버**가 `Peer Connection`을 형성합니다.
2. 생성된 `Peer Connection`과 **Sender**의 `Socket ID`를 저장한 객체를 Receiver 배열(`receiverPCs`)에 추가합니다.
3. `SDP(Session Description Protocol)`를 `Answer` 형식으로 요청했던 사용자에게 반환합니다.

### Receiver의 Offer, Answer(`receiverOffer`)

1. `Media Stream`을 서버에 보낼 클라이언트 **Receiver**와 **서버**가 `Peer Connection`을 형성합니다.
2. 생성된 `Peer Connection`과 Receiver의 `Socket ID`를 갖는 객체를 Sender 배열(`senderPCs`)에 저장합니다.
3. `SDP(Session Description Protocol)`을 `Answer` 형식으로 요청했던 사용자에게 반환합니다.
4. 이 과정은 여러 번 실행되며, 기존에 방에 있던 모든 사용자에게 **Receiver**와의 `Peer Connection`을 추가합니다.

### Sender와 Receiver의 ICE Candidate 교환(`senderCandidate`, `receiverCandidate`)

- P2P 통신에 필요한 `ICE(Interactive Connectivity Establishment) Candidate`를 서로에게 제안하고 받습니다.

![webrtc](https://user-images.githubusercontent.com/43535460/182181018-99e163cf-5574-4169-be22-2d1fa2e58222.gif)

## Socket 통신을 활용한 채팅 및 술 게임

- 유저의 움직임 공유, 채팅 기능을 `socket.io` 라이브러리로 구현했습니다.
- 클라이언트가 서버에게 해당 데이터를 전송하면, 서버는 그 room에 있는 모든 클라이언트에게 해당 데이터를 전송하도록 구현했습니다.

### 사용자 움직임 업데이트

1. 클라이언트 : 움직임 발생 시 서버에게 본인의 위치를 전송합니다.(`playerMovement`)
2. 서버 : `playerMovement` 이벤트 수신 시 해당 room의 모든 사람에게 변경된 위치를 전송합니다.(`updatePlayersMovement`)
3. 클라이언트 : `updatePlayersMovement` 이벤트 수신 시 유저의 위치 정보 state를 업데이트합니다.
4. 클라이언트 : 부모의 state가 업데이트 되었으므로 canvus를 리렌더링 합니다.
    1. 왼쪽 다리를 뻗은 사진과 오른쪽 다리를 뻗은 사진을 교차로 보여주어 걷는 모션을 구현했습니다.

### 채팅 구현

1. 클라이언트 : 채팅 제출 시 서버로 `sendChat` 이벤트를 전송합니다. 사용자의 닉네임과 채팅 내용이 담겨 있습니다.
2. 서버 : 받은 채팅 데이터를 해당 room에 있는 모든 사람에게 `getChat` 이벤트로 전송합니다.

### 술 게임 구현

- 앞서 구현한 채팅 기능을 바탕으로 4가지 술 게임을 구현했습니다.
- 서버가 사용자 답변의 정답 여부를 검증하여 모든 사용자에게 결과를 전송합니다.
- 게임의 특성에 따라 각 사용자의 채팅 내용이 가려질 수 있습니다.
- 결과가 나오면 음주를 권유하는 서버의 채팅이 일정 시간을 두고 나옵니다.
- 구현한 술 게임 종류는 아래와 같습니다.
    - **지하철 게임**
        - 게임을 시작한 사람이 서울 1~9호선 중 하나를 선택합니다.
        - 선택한 호선의 역 이름을 순서대로 말하고, 틀린 사람이 지는 게임입니다.
        - 서버는 역 데이터를 가지고 있어, 사용자의 답변을 검증합니다.
        
    https://user-images.githubusercontent.com/43535460/182183214-59843bde-721f-4cb5-acc9-685580be64db.mp4

    - **더 게임 오브 데스**
        - 게임이 시작되면 각각 한 명을 지목합니다. 이때, 서버는 채팅을 클라이언트에게 전송하지 않기 때문에 각 사용자는 서로 누구를 지목했는지 알지 못합니다.
        - 게임을 시작한 사람이 숫자를 지정하면 그 숫자에 걸린 사람이 지는 게임입니다.
        - 서버는 각 사용자가 지목한 방향을 따라가며 누가 걸리는지 계산합니다.
    
    https://user-images.githubusercontent.com/43535460/182183713-5b2628d5-0d98-4b79-840a-542c12d9c158.mp4
    
    - **눈치 게임**
        - 게임이 시작되면 사용자는 1부터 숫자를 입력합니다.
        - 서버는 이전에 나왔던 숫자인지, 남은 사람이 1명인지 여부를 검증하여 각 사용자에게 결과를 전송합니다.
        
    https://user-images.githubusercontent.com/43535460/182184127-7c95f56c-b6ac-4c74-8916-c38d37356e40.mp4
    
    - **369 게임**
        - 1부터 숫자를 입력하고, 3의 배수가 들어간 숫자에서는 *을 입력해야 합니다.
        - 서버는 사용자의 순서에 해당하는 값을 입력했는지 여부를 검증합니다.
        
    https://user-images.githubusercontent.com/43535460/182184185-e1b8252d-c996-41f7-8fa6-67cf0ccd393d.mp4
