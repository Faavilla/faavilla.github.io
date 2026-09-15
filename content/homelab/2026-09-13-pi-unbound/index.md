---
title: 라즈베리파이5(8) - 언바운드 설치하기
desc: DNS 조회를 파이에 넘기기
date: 2026-09-13 10:00:00
---

### 언바운드란?
간단하게 말해서 DNS 조회를 파이에서 직접 진행하게 됩니다.

예를 들어 어떤 웹사이트에 접속하면 해당 사이트 IP를 확인하려고 루트, 최상위 도메인부터 네임서버를 거치는데 해당 과정을 파이에서 진행하게 됩니다.

---

### 언바운드 설치
파이홀에서 권장하는 대로 도커 말고 호스트에 직접 설치했습니다. 마스킹되지 않은 IP들은 공개되도 상관 없는 대역들 입니다.

```bash
# 설치
sudo apt update
sudo apt install -y unbound

# 설정 파일
sudo nano /etc/unbound/unbound.conf.d/pihole.conf

server:
  ip-freebind: yes # 부팅 시 eth0에 IP가 붙기 전에 시작되면 바인딩 실패로 서비스가 죽음
  interface: 127.0.0.1
  interface: <파이 IP>
  port: 5335
  do-ip4: yes
  do-udp: yes
  do-tcp: yes
  do-ip6: no
  prefer-ip6: no

  access-control: 127.0.0.0/8 allow
  access-control: <내부망 대역> allow
  access-control: 172.16.0.0/12 allow

  harden-glue: yes
  harden-dnssec-stripped: yes
  use-caps-for-id: no
  edns-buffer-size: 1232
  prefetch: yes
  num-threads: 1
  module-config: "validator iterator"

  msg-cache-size: 50m
  rrset-cache-size: 100m
  cache-min-ttl: 300
  cache-max-ttl: 86400

  private-address: 192.168.0.0/16
  private-address: 10.0.0.0/8
  private-address: 172.16.0.0/12
  private-address: 169.254.0.0/16
  private-address: 127.0.0.0/8

# 적용
sudo unbound-checkconf
sudo systemctl restart unbound
sudo systemctl enable unbound
sudo ss -tulpn | grep unbound
```

#### 동작 확인
```bash
# 동작 확인, dig 설치
sudo apt install -y dnsutils

# 기본 조회 (pi-hole.net — 파이홀 공식 사이트)
dig @127.0.0.1 -p 5335 pi-hole.net +short

# 재귀 모드 확인, 루트 네임서버 13개가 나와야 함
dig @127.0.0.1 -p 5335 . NS +short

# DNSSEC 검증 (verteiltesysteme.net — 테스트 도메인)
# sigfail: 서명을 일부러 깨뜨려둔 도메인 → SERVFAIL이 나와야 정상
# 첫 실행은 네임서버를 다 시도하느라 timeout이 먼저 뜰 수 있음, 이어서 한 번 더 실행하면 캐시에서 바로 나옴
dig @127.0.0.1 -p 5335 sigfail.verteiltesysteme.net

# sigok: 정상 서명 → NOERROR에 ad 플래그가 붙어야 정상
dig @127.0.0.1 -p 5335 sigok.verteiltesysteme.net
```

마지막 포스트로 파이홀 따로 작성하겠습니다.
