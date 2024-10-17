import React from 'react';
import './ActivityFeed.css';
import tempData from '../tempData.json';

// Define the Activity type
type Activity = {
  audit_event_lsn: number;
  details: string;
  event_time: string;
  event_type: string;
  object_database_company_name: string;
  object_database_id: number;
  object_database_name: string;
  user_email: string;
  rowsThisPage?: Array<{
    output_candidate_rentroll_id: number[];
    comparison_o_lettable_area_contracted_sqm: number | null;
    property_name: [number, string];
    output_o_lettable_area_contracted_sqm: number;
    portfolio_name: Array<number | string | null>;
    CONSTANT: boolean;
    output_walt_first_break_expiry: number;
    output_contracted_rent_pa: number;
    comparison_occupied: number;
    comparison_o_unit: number;
    comparison_walt_first_break_expiry: number | null;
    comparison_contracted_rent_pa: number | null;
    project_name: Array<number | string | null>;
    output_o_unit: number;
    output_occupied: number;
  }>;
};

// Define grouped activities type
type GroupedActivities = {
  [key: string]: Activity[];
};

// Function to group activities by date
const groupByDate = (activities: Activity[]): GroupedActivities => {
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  const groups: GroupedActivities = { Today: [], Yesterday: [] };

  activities.forEach((activity) => {
    const date = new Date(activity.event_time).toLocaleDateString();
    if (date === today) {
      groups.Today.push(activity);
    } else if (date === yesterday) {
      groups.Yesterday.push(activity);
    } else {
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    }
  });

  return groups;
};

const formatEventType = (type: string) => {
  return type
    .replace('extraction-completed', 'Rent Roll Extraction Complete')
    .replace('access-granted', 'Database Access Granted')
    .replace('access-revoked', 'Database Access Revoked');
};

const ActivityFeed: React.FC = () => {
  const groupedActivities = groupByDate(tempData as Activity[]);

  return (
    <div className="activity-feed">
      <h2>Activity Feed</h2>
      {Object.entries(groupedActivities).map(([dateLabel, activities]) => (
        <div key={dateLabel}>
          <h3 className="date-label">{dateLabel}</h3>
          {activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="event-header">
                <span className="dot-indicator"></span>
                <p className="event-title">{formatEventType(activity.event_type)}</p>
                <p className="event-time">
                  {new Date(activity.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="event-subtext">
                <p className="user-database">{activity.user_email}</p>
                <p className="user-database">{activity.object_database_name}</p>
              </div>
              {activity.event_type === 'extraction-completed' && (
                <>
                  <div className="activity-details blue-box">
                    <p><strong>Property Name:</strong> {activity.rowsThisPage?.[0]?.property_name[1] ?? 'N/A'}</p>
                    <p><strong>Rent Roll Date:</strong> {JSON.parse(activity.details).rentrolls?.[0]?.rentroll_date ?? 'N/A'}</p>
                    <p><strong>Unit Count:</strong> {activity.rowsThisPage?.[0]?.output_o_unit ?? 'N/A'}</p>
                    <p><strong>Occupancy:</strong> 86.5% <span className="positive">(+0.5%)</span></p>
                    <p><strong>Area:</strong> 17K sqm</p>
                    <p><strong>Rent:</strong> €4.09M <span className="positive">(+164K)</span></p>
                    <p><strong>WALT:</strong> 1.44 years <span className="negative">(-0.04%)</span></p>
                  </div>
                  <div className="activity-buttons">
                    <div className="badge badge-secondary full-width left-badge">Portfolio Name</div>
                    <div className="badge badge-secondary full-width right-badge">Project Name</div>
                  </div>
                  <div className="action-buttons">
                    <button className="view-rent-roll">View Rent Roll</button>
                    <button className="view-track-changes">View Track Changes</button>
                  </div>
                </>
              )}
              {activity.event_type === 'access-granted' && (
                <button className="view-database full-width">View Database</button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;












