import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { SchemaMetadata } from '../types';
import { Play, ArrowRight, Database, CheckCircle2 } from 'lucide-react';

interface FlowTracerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: SchemaMetadata;
  onHighlightTables: (tables: string[]) => void;
}

interface FlowStep {
  table: string;
  action: string;
  columns: string[];
  description: string;
}

interface UserFlow {
  name: string;
  description: string;
  icon: string;
  steps: FlowStep[];
}

export default function FlowTracer({ isOpen, onClose, schema, onHighlightTables }: FlowTracerProps) {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [customStartTable, setCustomStartTable] = useState('');

  // Predefined common flows
  const commonFlows: UserFlow[] = [
    {
      name: 'User Login Flow',
      description: 'How users authenticate and access the system',
      icon: '🔐',
      steps: [
        {
          table: 'users',
          action: 'Lookup user by email/username',
          columns: ['email', 'password_hash'],
          description: 'Find user account and verify credentials',
        },
        {
          table: 'user_sessions',
          action: 'Create session',
          columns: ['user_id', 'token', 'expires_at'],
          description: 'Generate session token for authenticated user',
        },
        {
          table: 'user_profiles',
          action: 'Load profile data',
          columns: ['user_id', 'avatar', 'preferences'],
          description: 'Get user profile information',
        },
        {
          table: 'user_roles',
          action: 'Check permissions',
          columns: ['user_id', 'role_id'],
          description: 'Determine user access level',
        },
      ],
    },
    {
      name: 'Driver Signup Flow',
      description: 'Complete driver onboarding process',
      icon: '🚚',
      steps: [
        {
          table: 'users',
          action: 'Create account',
          columns: ['email', 'password', 'phone'],
          description: 'Register new user account',
        },
        {
          table: 'drivers',
          action: 'Create driver profile',
          columns: ['user_id', 'license_number', 'vehicle_type'],
          description: 'Set up driver-specific information',
        },
        {
          table: 'driver_documents',
          action: 'Upload documents',
          columns: ['driver_id', 'document_type', 'file_url'],
          description: 'Submit required documents (license, insurance)',
        },
        {
          table: 'driver_verifications',
          action: 'Background check',
          columns: ['driver_id', 'status', 'verified_at'],
          description: 'Verify driver credentials',
        },
        {
          table: 'driver_availability',
          action: 'Set availability',
          columns: ['driver_id', 'is_available', 'location'],
          description: 'Mark driver as ready to accept jobs',
        },
      ],
    },
    {
      name: 'Subscriber Flow',
      description: 'Subscriber data and insights journey',
      icon: '👤',
      steps: [
        {
          table: 'subscribers',
          action: 'Get subscriber',
          columns: ['id', 'email', 'status'],
          description: 'Fetch subscriber basic info',
        },
        {
          table: 'ai_insights',
          action: 'Load insights',
          columns: ['subscriber_id', 'insight_type', 'data'],
          description: 'Get AI-generated insights for subscriber',
        },
        {
          table: 'notifications',
          action: 'Check notifications',
          columns: ['subscriber_id', 'type', 'read_at'],
          description: 'Fetch pending notifications',
        },
      ],
    },
    {
      name: 'Order Processing Flow',
      description: 'From order creation to delivery',
      icon: '📦',
      steps: [
        {
          table: 'orders',
          action: 'Create order',
          columns: ['customer_id', 'total', 'status'],
          description: 'Customer places order',
        },
        {
          table: 'order_items',
          action: 'Add items',
          columns: ['order_id', 'product_id', 'quantity'],
          description: 'Record ordered products',
        },
        {
          table: 'payments',
          action: 'Process payment',
          columns: ['order_id', 'amount', 'status'],
          description: 'Handle payment transaction',
        },
        {
          table: 'shipments',
          action: 'Create shipment',
          columns: ['order_id', 'tracking_number', 'carrier'],
          description: 'Prepare for delivery',
        },
        {
          table: 'deliveries',
          action: 'Assign driver',
          columns: ['shipment_id', 'driver_id', 'status'],
          description: 'Driver delivers order',
        },
      ],
    },
  ];

  // Filter flows based on available tables
  const availableFlows = commonFlows.filter(flow => {
    const allTables = schema.tables.map(t => t.name.toLowerCase());
    return flow.steps.some(step => allTables.includes(step.table.toLowerCase()));
  });

  const handleTraceFlow = (flow: UserFlow) => {
    // Find actual table names (case-insensitive)
    const tableMap = new Map(schema.tables.map(t => [t.name.toLowerCase(), t.name]));
    const tables = flow.steps
      .map(step => tableMap.get(step.table.toLowerCase()))
      .filter(Boolean) as string[];
    
    onHighlightTables(tables);
    setSelectedFlow(flow.name);
  };

  const handleCustomFlow = () => {
    if (!customStartTable) return;

    // Start from selected table and find related tables
    const startTable = schema.tables.find(
      t => t.name.toLowerCase() === customStartTable.toLowerCase()
    );

    if (!startTable) return;

    const relatedTables = new Set<string>([startTable.name]);

    // Add tables referenced by FKs
    startTable.foreignKeys.forEach(fk => {
      const refTable = fk.references.split('.')[0];
      relatedTables.add(refTable);
    });

    // Add tables that reference this table
    schema.relationships
      .filter(rel => rel.to === startTable.name)
      .forEach(rel => relatedTables.add(rel.from));

    onHighlightTables(Array.from(relatedTables));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            Flow Tracer - Debug User Journeys
          </DialogTitle>
          <DialogDescription>
            Trace through common workflows and see exactly which tables are involved
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Predefined Flows */}
          <div>
            <h3 className="font-semibold mb-3">Common Flows</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableFlows.map(flow => (
                <Card
                  key={flow.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedFlow === flow.name ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTraceFlow(flow)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{flow.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{flow.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {flow.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          {flow.steps.length} steps
                        </div>
                      </div>
                    </div>

                    {selectedFlow === flow.name && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {flow.steps.map((step, idx) => {
                          const tableExists = schema.tables.some(
                            t => t.name.toLowerCase() === step.table.toLowerCase()
                          );

                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-1">
                                {tableExists ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Database className="w-3 h-3 text-blue-500" />
                                  <span className={`font-mono text-sm ${
                                    tableExists ? 'text-blue-600 font-semibold' : 'text-gray-400'
                                  }`}>
                                    {step.table}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {step.action}
                                </div>
                                <div className="text-xs text-gray-500 italic">
                                  {step.description}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Flow */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Start Custom Flow From Any Table</h3>
            <div className="flex gap-2">
              <select
                value={customStartTable}
                onChange={(e) => setCustomStartTable(e.target.value)}
                className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select a starting table...</option>
                {schema.tables.map(table => (
                  <option key={table.name} value={table.name}>
                    {table.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleCustomFlow} disabled={!customStartTable}>
                <Play className="w-4 h-4 mr-2" />
                Trace Flow
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Shows the selected table + all directly related tables (1 hop)
            </p>
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                💡 Pro Tips
              </h4>
              <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Click a flow to highlight all involved tables in the graph</li>
                <li>• Green checkmarks show tables that exist in your schema</li>
                <li>• Use custom flow to explore from any table</li>
                <li>• Combine with Search to find specific columns in the flow</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}


