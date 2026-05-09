FROM rust:slim
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/iden3/circom.git /circom
WORKDIR /circom
RUN cargo build --release && cargo install --path circom
WORKDIR /workspace
ENTRYPOINT ["circom"]
