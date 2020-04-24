if [ -d "/etc/netdata" ]; then
  sudo chown ${USER} /etc/netdata -R

  echo "netdata already installed"
  exit 0
fi

bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --stable-channel
sudo chown ${USER} /etc/netdata -R
