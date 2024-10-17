import React from 'react';
import './ActivityFeed.css';
import tempData from '../tempData.json';

type Activity = {
  audit_event_lsn: number;
  details: string;
  event_time: string;
  event_type: string;
  object_database_company_name: string;
  object_database_id: number;
  object_database_name: string;
  user_email: string;
  read: boolean;
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

type GroupedActivities = {
  [key: string]: Activity[];
};

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
};

const formatEventType = (type: string) => {
  return type
    .replace('extraction-completed', 'Rent Roll Extraction Complete')
    .replace('user-added-to-db', 'Database Access Granted')
    .replace('user-removed-from-db', 'Database Access Revoked');
};

const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

const ActivityFeed: React.FC = () => {
  const groupedActivities = groupByDate(tempData as Activity[]);

  return (
    <div className="activity-feed">
      <h2>Activity Feed</h2>
      {Object.entries(groupedActivities).map(([dateLabel, activities]) => (
        <div key={dateLabel}>
          <h3 className="date-label">{dateLabel}</h3>
          {activities.map((activity, index) => {
            const details = JSON.parse(activity.details);
            const rentrollDate = details.rentroll_date ? formatDate(details.rentroll_date) : 'N/A';
            const row = activity.rowsThisPage?.[0];

            return (
              <div key={index} className="activity-item">
                <div className="event-header">
                  <span
                    className="dot-indicator"
                    style={{ backgroundColor: activity.read ? 'green' : 'red' }}
                  ></span>
                  <p className="event-title">{formatEventType(activity.event_type)}</p>
                  <p className="event-time">
                    {new Date(activity.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="event-subtext">
                  <p className="user-database">{activity.user_email}</p>
                  <p className="user-database">{activity.object_database_name}</p>
                </div>
                {activity.event_type === 'extraction-completed' && row && (
                  <>
                    <div className="activity-details blue-box">
                      <p><strong>Property Name:</strong> {row.property_name[1] ?? 'N/A'}</p>
                      <p><strong>Rent Roll Date:</strong> {rentrollDate}</p>
                      <p>
                        <strong>Unit Count:</strong> {row.output_o_unit ?? 'N/A'}
                        {row.comparison_o_unit !== undefined && (
                          (() => {
                            const unitDiff = row.output_o_unit - (row.comparison_o_unit ?? 0);
                            const unitClass = unitDiff >= 0 ? 'positive' : 'negative';
                            return (
                              <span className={unitClass}>
                                ({unitDiff})
                              </span>
                            );
                          })()
                        )}
                      </p>
                      <p>
                        <strong>Occupancy:</strong>{' '}
                        {(row.output_occupied * 100).toFixed(2)}%
                        {row.comparison_o_unit > 0 &&
                          row.comparison_occupied !== null &&
                          row.comparison_occupied !== undefined &&
                          (() => {
                            const occDiff = (
                              (row.comparison_occupied - row.output_occupied) *
                              100
                            ).toFixed(2);
                            const occClass =
                              Number(occDiff) >= 0 ? 'positive' : 'negative';
                            return (
                              <span className={occClass}>({occDiff}%)</span>
                            );
                          })()}
                      </p>

                      <p>
                        <strong>Area:</strong> {formatNumber(row.output_o_lettable_area_contracted_sqm)} sqm
                        {row.comparison_o_lettable_area_contracted_sqm !== null && row.output_o_lettable_area_contracted_sqm !== 0 && (
                          (() => {
                            const areaDiff = (((row.output_o_lettable_area_contracted_sqm - row.comparison_o_lettable_area_contracted_sqm) / row.output_o_lettable_area_contracted_sqm) * 100).toFixed(2);
                            const areaClass = Number(areaDiff) >= 0 ? 'positive' : 'negative';
                            return (
                              <span className={areaClass}>
                                ({areaDiff}%)
                              </span>
                            );
                          })()
                        )}
                      </p>
                      <p>
                        <strong>Rent:</strong> {formatNumber(row.output_contracted_rent_pa)} EUR
                        {row.comparison_contracted_rent_pa !== null && (
                          (() => {
                            const currentRent = row.output_contracted_rent_pa ?? 0;
                            const comparisonRent = row.comparison_contracted_rent_pa ?? 0;
                            const rentDiff = (((currentRent - comparisonRent) / currentRent) * 100).toFixed(2);
                            const rentClass = (currentRent - comparisonRent) >= 0 ? 'positive' : 'negative';
                            return (
                              <span className={rentClass}>
                                ({rentDiff}%)
                              </span>
                            );
                          })()
                        )}
                      </p>
                      <p>
                        <strong>WALT:</strong> {row.output_walt_first_break_expiry?.toFixed(2) ?? 'N/A'} years
                        {row.comparison_walt_first_break_expiry !== null && row.output_walt_first_break_expiry !== 0 && (
                          (() => {
                            const waltDiff = ((( row.output_walt_first_break_expiry - row.comparison_walt_first_break_expiry) / row.output_walt_first_break_expiry) * 100).toFixed(2);
                            const waltClass = Number(waltDiff) >= 0 ? 'positive' : 'negative';
                            return (
                              <span className={waltClass}>
                                ({waltDiff}%)
                              </span>
                            );
                          })()
                        )}
                      </p>
                    </div>
                    <div className="badge-container">
                      <div className="badge">Portfolio Name</div>
                      <div className="badge">Project Name</div>
                    </div>
                    <div className="action-buttons">
                      <button className="view-rent-roll">View Rent Roll</button>
                      <button className="view-track-changes">View Track Changes</button>
                    </div>
                  </>
                )}
                {(activity.event_type === 'user-added-to-db' || activity.event_type === 'user-removed-from-db') && (
                  <div className="database-status">
                    <button className="view-database full-width">View Database</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;















