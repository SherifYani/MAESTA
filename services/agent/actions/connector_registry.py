from typing import Dict, Any, Optional, Protocol
from .schemas import ActionConnectorConfig

class ActionConnector(Protocol):
    def execute(self, action_type: str, payload: Dict[str, Any], connector_config: Optional[Any] = None) -> Dict[str, Any]:
        ...

class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[str, ActionConnector] = {}
        # Simple registry for Phase 7
        self._configs: Dict[str, ActionConnectorConfig] = {}

    def register_connector(self, name: str, connector: ActionConnector):
        self._connectors[name] = connector

    def get_connector_by_type(self, connector_type: str) -> Optional[ActionConnector]:
        """Directly fetch a connector instance by its registered type name."""
        return self._connectors.get(connector_type)

    def get_connector_for_action(self, action_type: str, tenant_id: str, site_id: str, bot_id: str) -> Optional[ActionConnector]:
        # Legacy/Simple lookup for Phase 7.1
        config_key = f"{tenant_id}:{site_id}:{bot_id}:{action_type}"
        config = self._configs.get(config_key)
        
        if not config or not config.enabled:
            return None
            
        return self.get_connector_by_type(config.connector_type)

    def set_config(self, config: ActionConnectorConfig):
        key = f"{config.tenant_id}:{config.site_id}:{config.bot_id}:{config.action_type}"
        self._configs[key] = config

# Global instance
registry = ConnectorRegistry()
