FROM ghcr.io/infinityofspace/jellyfin_alexa_skill:latest
COPY custom/ /custom/
RUN python /custom/apply_patch.py && rm -rf /custom
