import { networkInterfaces } from 'os';

export class NetworkService {
  /**
   * Get the local network IP address
   * Returns the first non-internal IPv4 address found
   */
  static getLocalIP(): string {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        // Skip internal and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    
    return 'localhost';
  }

  /**
   * Get all available network addresses
   */
  static getAllAddresses(): { name: string; address: string }[] {
    const nets = networkInterfaces();
    const addresses: { name: string; address: string }[] = [];
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push({ name, address: net.address });
        }
      }
    }
    
    return addresses;
  }

  /**
   * Log all available server URLs
   */
  static logServerUrls(port: number, logger: { log: (msg: string) => void }): void {
    const localIP = this.getLocalIP();
    
    logger.log('═══════════════════════════════════════════════════════════');
    logger.log('  🚀 Backend Server is running!');
    logger.log('═══════════════════════════════════════════════════════════');
    logger.log('');
    logger.log('  📡 Local:    http://localhost:' + port);
    logger.log('  📡 Network:  http://' + localIP + ':' + port);
    logger.log('');
    logger.log('  📚 API:      http://' + localIP + ':' + port + '/api');
    logger.log('  📖 Swagger:  http://' + localIP + ':' + port + '/api/swagger');
    logger.log('');
    logger.log('═══════════════════════════════════════════════════════════');
    logger.log('');
    logger.log('  💡 For mobile app, set EXPO_PUBLIC_BASE_URL to:');
    logger.log('     http://' + localIP + ':' + port);
    logger.log('');
    logger.log('═══════════════════════════════════════════════════════════');
  }
}

