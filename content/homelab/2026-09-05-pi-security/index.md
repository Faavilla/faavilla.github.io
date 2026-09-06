---
title: 라즈베리파이5(6) - 간단한 보안, 성능 설정
desc: 최소한의 보안, 성능 설정들 챙겨보기
date: 2026-09-05
---

### 최소한으로도 챙기려는 이유
털어갈 것도 없는 가벼운 수준으로 구동중이지만 그래도 혹시나 하는것도 있고, 설정 해보는거도 재밌을거 같아서 해봤습니다.

### 우마미 터널 설정
기존에는 우마미 루트(대시보드, 로그인)를 바로 공개했는데, 이렇게 하면 외부에서도 통계를 볼 수 있는건 편하지만 로그인 페이지 자체가 다른사람들 한테도 노출되고, 테일스케일같은건 아직 생각이 없어서 꼭 필요한 경로 2개만 제외하고 다 블로그로 리다이렉트 하도록 설정했습니다.

#### 리다이렉트 설정
클라우드플레어 도메인 -> 규칙 -> 리디렉션규칙 -> 사용자 설정 필터 식

```
http.host eq "우마미 루트 주소" and not http.request.uri.path in {"/script.js" "/api/send"}
```

간단하게 보면 우마미 주소로 접속하고, url이 `/script.js`, `/api/send`이 아닌 모든 주소를 지정합니다.  
그리고 나서 URL리디렉션 유형 고정, 상태코드 302로 `faavilla.com`으로 url설정하였습니다.

#### 터널 경로 설정
터널에 로그인 경로를 포함하는 루트를 열지 않고, 데이터 수집에 필요한 스크립트, api만 열게끔 설정했습니다.

서브도메인, 도메인, 서비스 URL을 설정하고, 경로를 `^/script\.js$`, `^/api/send$` 두개만 설정했습니다.  
정규식 기호가 들어가는건 경로를 변형해서 우회하는걸 막으려고 해두었습니다.

---

### 도커 성능 제한 설정
파이5라서 어느정도 성능에 여유는 있지만 그래도 다른 서비스들에 영향이 생기는 혹시모르는 상황이 생기는것보단 나을 것 같아서, 간단하게 성능 제한을 도커 컴포즈 파일에 입력해 두었습니다.

#### 파이에 설정 먼저
```bash
# 파일 백업
sudo cp /boot/firmware/cmdline.txt /boot/firmware/cmdline.txt.bak

# 설정 입력, 줄바꿈 방지를 위해 sed사용, cpu는 기본으로 켜져 있어 메모리만 설정
sudo sed -i 's/$/ cgroup_memory=1 cgroup_enable=memory/' /boot/firmware/cmdline.txt

# 내용 확인 및 줄바꿈 여부 확인, 줄바꿈 있으면 되돌려야함
cat /boot/firmware/cmdline.txt
wc -l /boot/firmware/cmdline.txt

# 완료 후 재부팅

# 반영 확인
cat /sys/fs/cgroup/cgroup.controllers
```

이후 각 도커 컴포즈 파일에 적당하게 성능 제한을 걸어두었습니다.

```yml
# 예시
services:
  umami:
    ...
    deploy:
      resources:
        limits:
          cpus: '0.8'
          memory: 500M
```

이후 도커 명령어로 적용 됐는지 확인해보면 됩니다.

```bash
# 현재 사용량 / 제한 이렇게 뜨면 적용된 상태입니다.
docker stats --no-stream
```

간단하지만 나름 경험이고 나중에 쓸모 있을지도 모르니까 한번 해봤습니다.
