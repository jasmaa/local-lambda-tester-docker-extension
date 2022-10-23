import { useEffect, useState } from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { cleanJson } from './utils';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [containers, setContainers] = useState<any[]>();
  const [targetContainerId, setTargetContainerId] = useState<string>('');
  const [payload, setPayload] = useState<string>('{}');
  const [result, setResult] = useState<string>('');
  const [isResultError, setIsResultError] = useState<boolean>(false);
  const ddClient = useDockerDesktopClient();

  const handleTest = async () => {
    try {
      // Check for container id
      if (!targetContainerId) {
        throw new Error('No container selected');
      }

      // Determine port
      const res = await ddClient.docker.cli.exec('inspect', [
        targetContainerId
      ]);
      const containers = res.parseJsonObject();
      const targetContainer = containers.find((container) => container['Id'] === targetContainerId);
      if (!('ExposedPorts' in targetContainer['Config'])) {
        throw new Error('No exposed ports found for container');
      }
      const exposedPorts = Object.keys(targetContainer['Config']['ExposedPorts']);
      if (exposedPorts.length < 1) {
        throw new Error('No exposed ports found for container');
      }
      const exposedPort = exposedPorts[0];
      const targetHosts = targetContainer['NetworkSettings']['Ports'][exposedPort];
      if (targetHosts.length < 1) {
        throw new Error('No hosts found for container');
      }
      const targetHost = targetHosts[0];

      // Send payload
      const cleanPayload = JSON.stringify(cleanJson(payload));
      try {
        const payloadRes = await ddClient.extension.host?.cli.exec('send-payload', [
          `localhost:${targetHost['HostPort']}`,
          cleanPayload,
        ]);
        const payloadResult = JSON.parse(payloadRes.stdout);
        setResult(JSON.stringify(payloadResult, null, 2));
        setIsResultError('errorMessage' in payloadResult);
        ddClient.desktopUI.toast.success('Message was successfully sent!');
      } catch (e) {
        ddClient.desktopUI.toast.error('Error sending payload');
      }
    } catch (e) {
      ddClient.desktopUI.toast.error(e.message);
    }
  }

  useEffect(() => {
    (async () => {
      const res = await ddClient.docker.listContainers() as any[];
      setContainers(res);
      setIsLoading(false);
    })();
  }, [ddClient]);

  if (isLoading) {
    return (
      <CircularProgress />
    );
  }

  return containers && containers.length > 0
    ? (
      <>
        <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Container</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              value={targetContainerId}
              label="Container"
              onChange={(event) => {
                setTargetContainerId(event.target.value as string);
              }}
            >
              {containers.map((container) => (
                <MenuItem key={container['Id']} value={container['Id']}>{container['Names']}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" size="large" onClick={handleTest}>Test</Button>
        </Stack>
        {result && (
          <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
            <FormControl fullWidth>
              <Box p={3} sx={{
                backgroundColor: isResultError ? 'pink' : 'lightgreen',
                borderRadius: '0.5em',
              }}>
                <Typography variant="h3">Result</Typography>
                <Box mt={1}>
                  <pre>{result}</pre>
                </Box>
              </Box>
            </FormControl>
          </Stack>
        )}
        <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
          <FormControl fullWidth>
            <TextField
              label="Payload"
              variant="outlined"
              multiline
              rows={10}
              value={payload}
              onChange={(event) => {
                setPayload(event.target.value);
              }} />
          </FormControl>
        </Stack>
      </>
    )
    : <Typography variant="h3">No containers running</Typography>
}
